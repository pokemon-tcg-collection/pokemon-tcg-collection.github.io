"""
Generate Pokemon list with minimal info and sprites.

Requires:
- sprites from https://github.com/PokeAPI/sprites
- pokemon data from https://github.com/PokeAPI/pokeapi

Run:
    git clone git@github.com:PokeAPI/sprites.git
    git clone git@github.com:PokeAPI/pokeapi.git
    python3 pokeapi-generate.py

Generates:
- out/sprites/*.png - sprites (if found)
- out/pokemon.json - list of pokemon info
"""

import csv
import json
import os.path
import shutil
import sys
from dataclasses import dataclass

DN_OUTPUT_SPRITES = "out/sprites"
FN_OUTPUT_INFO = "out/pokemon.json"

DN_SPRITES = "sprites/sprites/pokemon"
DN_CSV_DATA = "pokeapi/data/v2/csv"

FN_LANGUAGES = "languages.csv"
FN_POKEMON = "pokemon.csv"
FN_POKEMON_SPECIES = "pokemon_species.csv"
FN_POKEMON_SPECIES_NAMES = "pokemon_species_names.csv"
FN_GENERATIONS = "generations.csv"
FN_GENERATION_NAMES = "generation_names.csv"
FN_POKEDEXES = "pokedexes.csv"
FN_POKEDEX_NUMBERS = "pokemon_dex_numbers.csv"
FN_REGIONS = "regions.csv"
FN_REGION_NAMES = "region_names.csv"

FN_SPRITE_SUBSTITUTE = "substitute.png"
FN_SPRITE_NOT_FOUND = "0.png"


@dataclass
class Language:
    id: int
    iso639: str
    iso3166: str
    identifier: str
    official: bool


@dataclass
class Pokemon:
    id: int
    identifier: str
    species_id: str
    is_default: bool


@dataclass
class PokemonSpecies:
    id: int
    identifier: str
    generation_id: int
    evolves_from_species_id: int | None
    may_have_variants: bool


@dataclass
class PokemonSpeciesName:
    pokemon_species_id: int
    local_language_id: int
    name: str


@dataclass
class Generation:
    id: int
    main_region_id: int
    identifier: str


@dataclass
class GenerationName:
    generation_id: int
    local_language_id: int
    name: str


@dataclass
class Pokedex:
    id: int
    region_id: int | None
    identifier: str
    is_main_series: bool


@dataclass
class PokedexNumber:
    species_id: int
    pokedex_id: int
    pokedex_number: int


@dataclass
class RegionName:
    region_id: int
    local_language_id: int
    name: str


@dataclass
class Region:
    id: int
    identifier: str


def main():
    assert os.path.exists(DN_CSV_DATA), "No CSV PokeAPI data found!"
    assert os.path.exists(DN_SPRITES), "No PokeAPI sprites found!"

    # ----------------------------------------------------------------------

    bool_map = {"1": True, "0": False}

    languages: dict[int, Language] = dict()
    key2language: dict[str, Language] = dict()
    generations: dict[int, Generation] = dict()
    generation_names: dict[int, dict[int, GenerationName]] = dict()
    regions: dict[int, Region] = dict()
    region_names: dict[int, dict[int, RegionName]] = dict()
    dexes: dict[int, Pokedex] = dict()
    dex_numbers: dict[int, dict[int, PokedexNumber]] = dict()
    species: dict[int, PokemonSpecies] = dict()
    species_names: dict[int, dict[int, PokemonSpeciesName]] = dict()
    pokemons: dict[int, Pokemon] = dict()

    sprites: dict[int, str] = dict()

    # ----------------------------------------------------------------------
    # load language lookup

    print("[*] Load languages ...")

    with open(os.path.join(DN_CSV_DATA, FN_LANGUAGES), newline="") as fp:
        reader = csv.DictReader(fp)
        for row in reader:
            language = Language(
                id=int(row["id"]),
                iso639=row["iso639"],
                iso3166=row["iso3166"],
                identifier=row["identifier"],
                official=bool_map.get(row["official"], False),
            )
            languages[language.id] = language

    for language in languages.values():
        if not language.iso639 in key2language:
            key2language[language.iso639] = language

    eng_language_id = key2language["en"].id

    # ----------------------------------------------------------------------
    # load pokemon data

    print("[*] Load Pokemon data ...")

    print("[*] - generation ...")

    with open(os.path.join(DN_CSV_DATA, FN_GENERATION_NAMES), newline="") as fp:
        reader = csv.DictReader(fp)
        for row in reader:
            name = GenerationName(
                generation_id=int(row["generation_id"]),
                local_language_id=int(row["local_language_id"]),
                name=row["name"],
            )
            try:
                generation_names[name.generation_id][name.local_language_id] = name
            except KeyError:
                generation_names[name.generation_id] = {name.local_language_id: name}

    with open(os.path.join(DN_CSV_DATA, FN_GENERATIONS), newline="") as fp:
        reader = csv.DictReader(fp)
        for row in reader:
            generation = Generation(
                id=int(row["id"]),
                main_region_id=int(row["main_region_id"]),
                identifier=row["identifier"],
            )
            generations[generation.id] = generation

    print("[*] - regions ...")

    with open(os.path.join(DN_CSV_DATA, FN_REGION_NAMES), newline="") as fp:
        reader = csv.DictReader(fp)
        for row in reader:
            name = RegionName(
                region_id=int(row["region_id"]),
                local_language_id=int(row["local_language_id"]),
                name=row["name"],
            )
            try:
                region_names[name.region_id][name.local_language_id] = name
            except KeyError:
                region_names[name.region_id] = {name.local_language_id: name}

    with open(os.path.join(DN_CSV_DATA, FN_REGIONS), newline="") as fp:
        reader = csv.DictReader(fp)
        for row in reader:
            region = Region(
                id=int(row["id"]),
                identifier=row["identifier"],
            )
            regions[region.id] = region

    print("[*] - pokedexes ...")

    with open(os.path.join(DN_CSV_DATA, FN_POKEDEXES), newline="") as fp:
        reader = csv.DictReader(fp)
        for row in reader:
            dex = Pokedex(
                id=int(row["id"]),
                region_id=int(row["region_id"]) if row["region_id"] else None,
                identifier=row["identifier"],
                is_main_series=bool_map.get(row["is_main_series"], False),
            )
            dexes[dex.id] = dex

    # TODO: BOM?
    with open(
        os.path.join(DN_CSV_DATA, FN_POKEDEX_NUMBERS), newline="", encoding="utf-8-sig"
    ) as fp:
        reader = csv.DictReader(fp)
        for row in reader:
            number = PokedexNumber(
                species_id=int(row["species_id"]),
                pokedex_id=int(row["pokedex_id"]),
                pokedex_number=int(row["pokedex_number"]),
            )
            try:
                dex_numbers[number.species_id][number.pokedex_id] = number
            except KeyError:
                dex_numbers[number.species_id] = {number.pokedex_id: number}

    print("[*] - pokemon ...")

    with open(os.path.join(DN_CSV_DATA, FN_POKEMON_SPECIES_NAMES), newline="") as fp:
        reader = csv.DictReader(fp)
        for row in reader:
            name = PokemonSpeciesName(
                pokemon_species_id=int(row["pokemon_species_id"]),
                local_language_id=int(row["local_language_id"]),
                name=row["name"],
            )
            try:
                species_names[name.pokemon_species_id][name.local_language_id] = name
            except KeyError:
                species_names[name.pokemon_species_id] = {name.local_language_id: name}

    with open(os.path.join(DN_CSV_DATA, FN_POKEMON_SPECIES), newline="") as fp:
        reader = csv.DictReader(fp)
        for row in reader:
            pokemon = PokemonSpecies(
                id=int(row["id"]),
                identifier=row["identifier"],
                generation_id=int(row["generation_id"]),
                evolves_from_species_id=(
                    int(row["evolves_from_species_id"])
                    if row["evolves_from_species_id"]
                    else None
                ),
                may_have_variants=bool_map.get(row["has_gender_differences"], False)
                or bool_map.get(row["forms_switchable"], False),
            )

            # if pokemon.may_have_variants:
            #     print(f"{pokemon=}")
            # if pokemon.id == 1024:
            #     print(f"{row=}")

            species[pokemon.id] = pokemon

    with open(os.path.join(DN_CSV_DATA, FN_POKEMON), newline="") as fp:
        reader = csv.DictReader(fp)
        for row in reader:
            pokemon = Pokemon(
                id=int(row["id"]),
                identifier=row["identifier"],
                species_id=int(row["species_id"]),
                is_default=bool_map.get(row["is_default"], False),
            )
            assert (pokemon.id != pokemon.species_id) == (
                not pokemon.is_default
            ), f"{pokemon=}"
            # if not pokemon.is_default:
            #     print(f"{pokemon=}")
            pokemons[pokemon.id] = pokemon

    # print()
    # sus = sorted([x.id for x in species.values() if x.may_have_variants])
    # print(sus)
    # sus2 = sorted(set([x.species_id for x in pokemons.values() if not x.is_default]))
    # print(sus2)

    # ----------------------------------------------------------------------
    # check sprites

    print("[*] Find sprites ...")

    for id in pokemons.keys():
        fn = os.path.join(DN_SPRITES, f"{id}.png")
        if not os.path.exists(fn):
            print(f"Sprite not found: {fn=}", file=sys.stderr)
            # fn = os.path.join(DN_SPRITES, f"0.png")
        else:
            sprites[id] = fn

    # ----------------------------------------------------------------------
    # generate output

    print("[*] Generate info ...")

    entries = list()
    fns_sprite = list()

    for pokemon in pokemons.values():
        pokemon_species = species[pokemon.species_id]
        names = species_names[pokemon_species.id]

        special = not pokemon.is_default

        generation = generations[pokemon_species.generation_id].identifier
        if generation.startswith("generation-"):
            generation = generation[11:]

        name = names[eng_language_id].name
        if special:
            if pokemon.identifier.endswith("-mega"):
                name = f"Mega {name}"
            # elif pokemon.identifier.endswith("-gmax"):
            #     pass
            elif pokemon.identifier.endswith("-hisui"):
                name = f"Hisui {name}"
            elif pokemon.identifier.endswith("-galar"):
                name = f"Galar {name}"
            elif pokemon.identifier.endswith("-alola"):
                name = f"Alola {name}"
            else:
                print(
                    f"Skipping unknown non-default form: '{pokemon.identifier}'"
                    f" ({pokemon.id}, species: {pokemon.species_id})"
                )
                continue
            # eternamax, rapid-strike,

        entry = {
            "id": pokemon.id,
            "sid": pokemon.species_id,
            "identifier": pokemon.identifier,
            "name": name,
            "generation": generation,
            "sprite": pokemon.id in sprites,
            # TODO: metadata: mega-evo?
        }

        entries.append(entry)
        if pokemon.id in sprites:
            fns_sprite.append(sprites[pokemon.id])

    fns_sprite.append(os.path.join(DN_SPRITES, "0.png"))
    fns_sprite.append(os.path.join(DN_SPRITES, "substitute.png"))

    # ----------------------------------------------------------------------

    if os.path.exists(DN_OUTPUT_SPRITES):
        shutil.rmtree(DN_OUTPUT_SPRITES)
    os.makedirs(DN_OUTPUT_SPRITES, exist_ok=True)

    for fn_sprite in fns_sprite:
        shutil.copy(fn_sprite, DN_OUTPUT_SPRITES)

    print(f"[*] Copied {len(fns_sprite)} Pokemon sprites to '{DN_OUTPUT_SPRITES}'.")

    os.makedirs(os.path.dirname(FN_OUTPUT_INFO), exist_ok=True)
    with open(FN_OUTPUT_INFO, "w") as fp:
        json.dump(entries, fp)

    print(f"[*] Wrote {len(entries)} Pokemon info to '{FN_OUTPUT_INFO}'.")


if __name__ == "__main__":
    main()
