"""
Generates TCGdex set data for a single set.
Uses cached tcg.mik.moe data with Jinja2 templates to generate card information.

Requires:
    - out/tcg-mik-moe/ - scraped pokemon data
    - virtual environment with Jinja2 installed

Run:
    python3 convert_tcgmikmoe2tcgdex.py

Generates:
    - out/tcg-mik-moe-tcgdex/<set>/... - single set export to merge into cards-database
"""

import json
import logging
import os.path
import re
import shutil
from pathlib import Path
from typing import Any, Dict, Optional

try:
    from jinja2 import (
        Environment,
        FileSystemLoader,
        StrictUndefined,
        TemplateRuntimeError,
        nodes,
        select_autoescape,
    )
    from jinja2.ext import Extension
except ImportError:
    import sys

    print(
        """Dependency 'jinja' missing. Please install first, before running the script again.
        
        $ pip install Jinja2
        """,
        file=sys.stderr,
    )

    sys.exit(1)


# --------------------------------------------------------------------------

LOGGER = logging.getLogger(
    __name__
    if __name__ != "__main__"
    else os.path.splitext(os.path.basename(__file__))[0]
)

# --------------------------------------------------------------------------

base = os.path.dirname(__file__)
relbase = os.getcwd()

DN_INPUT = os.path.relpath(os.path.join(base, "./out/tcg-mik-moe"), relbase)
DN_OUTPUT = os.path.relpath(os.path.join(base, "./out/tcg-mik-moe-tcgdex"), relbase)
DN_TEMPLATES = os.path.relpath(os.path.join(base, "./templates"), relbase)

FN_POKEMONS = os.path.relpath(
    os.path.join(base, "../src/apis/pokeapi/pokemon.json"), relbase
)

# --------------------------------------------------------------------------


def cardType2category(value: str):
    return {
        "Pokemon": "Pokemon",
        "Tool": "Trainer",
        "Supporter": "Trainer",
        "Stadium": "Trainer",
        "Item": "Trainer",
        # "Energy": "Energy",
        "Special Energy": "Energy",
    }[value]


def pokemonName2species(value: str):
    value_orig = value

    if value.endswith("-GX"):
        value = value[: -len("-GX")]
    if value.endswith(" V"):
        value = value[: -len(" V")]
    if value.endswith(" VMAX"):
        value = value[: -len(" VMAX")]
    if value.endswith(" Prism Star"):
        value = value[: -len(" Prism Star")]
    # if value.startswith("Ultra "):
    #     value = value[len("Ultra ") :]

    if value.startswith("Alolan "):
        # value = "Alola " + value[len("Alolan ") :]
        value = value[len("Alolan ") :]
    if value.startswith("Galarian "):
        # value = "Galar " + value[len("Galarian ") :]
        value = value[len("Galarian ") :]

    if value.endswith(" Rotom"):
        value = "Rotom"
    elif value.endswith(" Necrozma"):
        value = "Necrozma"
    elif value.endswith(" Kyurem"):
        value = "Kyurem"
    elif value == "Flabebe":
        value = "Flab\u00e9b\u00e9"
    elif value == "Farfetch'd":
        value = "Farfetch\u2019d"
    elif value == "Sirfetch'd":
        value = "Sirfetch\u2019d"

    if value != value_orig:
        LOGGER.debug(f"Normalized pokemon name from '{value_orig}' to '{value}'")

    return value


def jinja_env(dn_template: str | os.PathLike | Path = DN_TEMPLATES):
    # template environment with simple templates/ directory

    env = Environment(
        loader=FileSystemLoader(dn_template),
        autoescape=select_autoescape(),
        undefined=StrictUndefined,
    )

    # custom filters

    def energy2str(value: str):
        return {
            "R": "Fire",
            "W": "Water",
            "L": "Lightning",
            "G": "Grass",
            "M": "Metal",
            "F": "Fighting",
            "D": "Darkness",
            "P": "Psychic",
            "C": "Colorless",
            "N": "Dragon",
            "Y": "Fairy",
        }[value]

    def rarity2str(value: str):
        # https://www.elitefourum.com/t/the-different-rarity-symbols-in-pokemon-card-sets-explained/46673
        return {
            # Main Set
            "C": "Common",
            "U": "Uncommon",
            "R": "Rare",
            "RR": "Double rare",
            # Specialty Set Rarities
            "S": "Shiny rare",
            "SSR": "Shiny Ultra Rare",
            # Secret Rares
            "AR": "Illustration rare",
            "SR": "Ultra Rare",
            "SAR": "Special illustration rare",
            "UR": "Hyper rare",
            # other
            "PR": "Prism Rare",  # TODO: Prism Rare
            # https://www.tcgdex.net/database/sm-sun-moon/sm5-ultra-prism/89-solgaleo-%25E2%2597%2587
            # https://tcg.mik.moe/cards/CSM1aC
            "K": "Radiant Rare",
            "HR": "Hyper rare",
            "RRR": "Triple rare",  # TODO: ?
        }[value]

    def cardType2trainerType(value: str):
        return {
            "Tool": "Tool",
            "Supporter": "Supporter",
            "Stadium": "Stadium",
            "Item": "Item",
        }[value]

    def cardType2energyType(value: str):
        return {
            "Energy": "Normal",
            "Special Energy": "Special",
        }[value]

    def stage2stage(value: str):
        return {
            "Basic": "Basic",
            "Stage 1": "Stage1",
            "Stage 2": "Stage2",
            "VMAX": "VMAX",
        }[value]

    def mechanic2suffix(value: str):
        return {
            "GX": "GX",
            # "Prism Star": "◇",  # TODO
        }[value]

    env.filters["energy2str"] = energy2str
    env.filters["rarity2str"] = rarity2str
    env.filters["cardType2trainerType"] = cardType2trainerType
    env.filters["cardType2energyType"] = cardType2energyType
    env.filters["stage2stage"] = stage2stage
    env.filters["mechanic2suffix"] = mechanic2suffix

    # custom tests (for filter application)

    def knownMechanic(value: str):
        try:
            mechanic2suffix(value)
            return True
        except KeyError:
            return False

    env.tests["knownMechanic"] = knownMechanic

    # custom extensions

    class AssertExtension(Extension):
        """from: https://stanislaw.github.io/2023-03-22-jinja-assertions.html"""

        # keywords
        tags = {"assert"}

        def __init__(self, environment):
            super().__init__(environment)
            self.current_line = None
            self.current_file = None

        def parse(self, parser):
            lineno = next(parser.stream).lineno
            self.current_line = lineno
            self.current_file = parser.filename

            condition_node = parser.parse_expression()
            if parser.stream.skip_if("comma"):
                context_node = parser.parse_expression()
            else:
                context_node = nodes.Const(None)

            return nodes.CallBlock(
                self.call_method(
                    "_assert", [condition_node, context_node], lineno=lineno
                ),
                [],
                [],
                [],
                lineno=lineno,
            )

        def _assert(self, condition: bool, context_or_none: Optional[Any], caller):
            if not condition:
                error_message = (
                    f"Assertion error in the Jinja template: "
                    f"{self.current_file}:{self.current_line}."
                )
                if context_or_none:
                    error_message += f" Message: {context_or_none}"
                raise TemplateRuntimeError(error_message)
            return ""

    env.add_extension(AssertExtension)

    return env


def jinja_template(category: str):
    tmpl_name = f"tcgdex-card-{category}.ts.jinja2"

    env = jinja_env()
    template = env.get_template(tmpl_name)

    return template


def jinja_context(card_details: Dict[str, Any]):
    cardType = card_details["cardType"]
    category = cardType2category(cardType)

    # attributes for all card types
    keys_base = {
        "setCode",  #: set
        "name",  #: name
        "description",  #: effect/...
        "artist",  #: illustrator
        "cardType",  #: category
        "regulationMark",  #: regulationMark
        "rarity",  #: rarity
    }

    # known attributes by card type / category
    keysMap = {
        "Pokemon": {*keys_base, "pokemonAttr", "mechanic", "ability"},
        "Trainer": {*keys_base},
        "Energy": {*keys_base},
    }
    keys = keysMap[category]

    if category in ("Trainer", "Energy"):
        assert card_details["description"]

    context = {k: v for k, v in card_details.items() if k in keys}
    return context


# --------------------------------------------------------------------------


def process_set_symbol(dn_input: Path, dn_output_images: Path, setId: str):
    fn_symbol = dn_input / "images" / f"{setId}.webp"
    if not fn_symbol.exists():
        return False

    fn_dest = dn_output_images / "symbol.webp"

    shutil.copy(fn_symbol, fn_dest)
    LOGGER.info(f"Found set symbol = {fn_dest}")

    return True


def process_cards(
    dn_input_set: Path,
    dn_output_cards: Path,
    dn_output_images: Path,
    pokemon2id: Dict[str, int] | None = None,
):
    dn_input = dn_input_set / "details"

    files = [
        file
        for file in dn_input.iterdir()
        if file.is_file() and file.name.endswith("-detail.json")
    ]
    files = sorted(files)

    for fn_card_details in files:
        LOGGER.debug(f"Processing '{fn_card_details}' ...")
        process_card(
            fn_card_details=fn_card_details,
            dn_output_cards=dn_output_cards,
            pokemon2id=pokemon2id,
        )


PAT_EMPTY_LINES = re.compile("\n(\t*\n){2,}")


def process_card(
    fn_card_details: Path,
    dn_output_cards: Path,
    pokemon2id: Dict[str, int] | None = None,
):
    with fn_card_details.open("rb") as fp:
        card_details = json.load(fp)

    cardType = card_details["cardType"]
    category = cardType2category(cardType)

    context = jinja_context(card_details)

    if category == "Pokemon":
        nameEn = card_details["nameEn"]
        nameEn = pokemonName2species(nameEn)
        dexId = pokemon2id[nameEn]
        context["dexId"] = dexId

    template = jinja_template(category)
    result = template.render(**context)
    result = PAT_EMPTY_LINES.sub("\n\n", result)

    fn_output_card = dn_output_cards / f"{card_details['cardIndex']}.ts"
    with fn_output_card.open("w") as fp:
        fp.write(result)


def main(
    dn_input: str | os.PathLike | Path,
    dn_output: str | os.PathLike | Path,
    setId: str,
    exist_ok: bool = True,
):
    dn_input = Path(dn_input)
    dn_output = Path(dn_output)

    if not dn_input.exists():
        raise FileNotFoundError(f"Input directory '{dn_input}' does not exist!")

    dn_output.mkdir(parents=True, exist_ok=True)

    dn_input_set = dn_input / "sets" / setId
    if not dn_input_set.exists():
        raise FileNotFoundError(
            f"Input folder '{dn_input_set}' for set '{setId}' does not exist!"
        )

    dn_output_set = dn_output / setId
    if dn_output_set.exists():
        LOGGER.warning(
            f"Output folder '{dn_output_set}' for set '{setId}' already exists!"
        )
    dn_output_set.mkdir(exist_ok=exist_ok)

    dn_output_images = dn_output_set / "images"
    dn_output_images.mkdir(parents=True, exist_ok=exist_ok)

    dn_output_cards = dn_output_set / "cards"
    dn_output_cards.mkdir(exist_ok=exist_ok)

    LOGGER.info(f"Input folder = {dn_input_set}")
    LOGGER.info(f"Output folder = {dn_output_set}")
    LOGGER.info(f"Output (logo, card images) folder = {dn_output_images}")
    LOGGER.info(f"Output (card data) folder = {dn_output_cards}")

    fn_pokemons = Path(FN_POKEMONS)
    pokemon2id: Dict[str, int] = {}
    if fn_pokemons.exists():
        with fn_pokemons.open("rb") as fp:
            data = json.load(fp)
        pokemon2id = {e["name"]: e["sid"] for e in data}

    process_set_symbol(
        dn_input=dn_input,
        dn_output_images=dn_output_images,
        setId=setId,
    )
    process_cards(
        dn_input_set=dn_input_set,
        dn_output_cards=dn_output_cards,
        dn_output_images=dn_output_images,
        pokemon2id=pokemon2id,
    )


# --------------------------------------------------------------------------


if __name__ == "__main__":
    logging.basicConfig(level=logging.DEBUG, format="[%(levelname)s] %(message)s")

    setIds = (
        [
            "CSM1aC",
            "CSM1bC",
            "CSM1cC",
            "CSM1.5C",
            "CSM2aC",
            "CSM2bC",
            "CSM2cC",
            "CSM2.5C",
        ]
        + [
            "CS1bC",
            "CS1aC",
            "CS1.5C",
            "CS2bC",
            "CS2aC",
            "CS2.5C",
            "CS3bC",
            "CS3aC",
            "CS3.5C",
            "CS4bC",
            "CS4aC",
            "CS4.5C",
            "CS5bC",
            "CS5aC",
            "CS5.5C",
            "CS6bC",
            "CS6aC",
            "CS6.5C",
        ]
        + [
            "CSV1C",
            "CSV2C",
            "CSV3C",
            "CSV4C",
            "CSV5C",
            "CSV6C",
            "CSV7C",
        ]
    )
    setId = setIds[0]  # errors = 4-7, 8 (RRR, Galarian), 11 (A)
    main(dn_input=DN_INPUT, dn_output=DN_OUTPUT, setId=setId)
