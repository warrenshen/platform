import numpy as np

TRANSFER_PACKAGES_START_DATE = '2020-01-01'
SALES_TRANSACTIONS_START_DATE = '2020-01-01'
CURRENT_MONTH = '2022-01'

COMPANY_IDENTIFIER_LIST = [
    'RA',
    'HPCC',
    'SFVPC',
    'EMA',
    'EMF',
    'EMM',
    'EMT',
    'GRG',
    'ST',
    'EL'
]

TESTING_COMPANY_NAMES = [
    'TT',
    'MD',
    'DWF',
    'GHC',
    'SV',
    '99HT'
]

CONFIDENCE_LEVEL = None
ERROR_STYLE = 'band'

MEASUREMENT_DICT = {
    'ounce': 28,
    'half ounce': 14,
    'quarter': 7,
    'eighth': 3.5,
    'gram': 1,
    # 'pound': 448
}

CONFIDENCE_BAND_MULTIPLIER = 1.96


def extract_letter_units_in_gram_mg(string):
    string = string.lower()
    if 'm' in string:
        measure = float(string.split('m')[0].strip()) * .001
    elif 'g' in string:
        measure = float(string.split('g')[0].strip())
    else:
        measure = float(string.split('l')[0].strip()) * 1000
    return measure

def extract_letter_units_in_gram(string):
    string = string.lower()
    if 'm' in string:
        return 1
    elif 'g' in string:
        measure = float(string.split('g')[0].strip())
    else:
        measure = float(string.split('l')[0].strip()) * 1000
    return measure

def extract_gram_units_gram_litre(string):
    string = string.lower()
    if 'half' in string:
        return .5
    return 1


def extract_oz_units_gram_litre(string):
    string = string.lower()
    string = string.split('oz')[0].strip()
    if '/' in string:
        nom_denom = string.split('/')
        measure = float(nom_denom[0]) / float(nom_denom[1]) * 28
    else:
        measure = float(string) * 28
    return measure

def extract_count_units(string):
    string = string.lower()
    if 'count' in string:
        measure = float(string.split('count')[0].strip())
    elif 'ct' in string:
        measure = float(string.split('ct')[0].strip())
    elif 'capsule' in string:
        measure = float(string.split('capsule')[0].strip())
    else:
        measure = float(string.split('pk')[0].strip())
    return measure

EXTRACTED_MEASUREMENT_COLUMNS = {
    #'letter_litre_measure_from_product_name': extract_letter_units_in_gram_ml,
    #'letter_milligram_measure_from_product_name': extract_letter_units_in_gram_mg,
    'letter_gram_measure_from_product_name': extract_letter_units_in_gram,
    'gram_measure_from_product_name': extract_gram_units_gram_litre,
    'oz_measure_from_product_name': extract_oz_units_gram_litre,
    #'count_measure_from_product_name': extract_count_units
}

TRAINING_OBJECT_NAME = 'msrp_band_analyzer_training_object'


# For each product category, if there are more multiple unit conversions, latter algorithm takes priority
# Ex. ['letter_gram_measure_from_product_name', 'extract_oz_units_gram_litre'], OZ takes priority over gram
PRODUCT_CATEGORY_NAME_NLP_USAGE_DICTIONARY = {
    'Flower (packaged eighth - each)': ['letter_gram_measure_from_product_name', 'gram_measure_from_product_name'],
    'Edible (weight - each)': [],
    'Vape Cartridge (weight - each)': ['letter_gram_measure_from_product_name', 'gram_measure_from_product_name'],
    'Infused (edible)': [],
    'Pre-Roll Flower': [],
    'Pre-Roll Infused': [],
    'Vape Cartridge (volume - each)': ['letter_gram_measure_from_product_name', 'gram_measure_from_product_name'],
    'Concentrate (Each)': ['letter_gram_measure_from_product_name', 'gram_measure_from_product_name'],
    'Extract (weight - each)': [],
    'Vape Product': ['letter_gram_measure_from_product_name', 'gram_measure_from_product_name'],
    'Pre-Roll Leaf': ['letter_gram_measure_from_product_name', 'gram_measure_from_product_name'],
    'Edible (volume - each)': ['oz_measure_from_product_name'],
    'Flower (packaged gram - each)': ['letter_gram_measure_from_product_name', 'gram_measure_from_product_name'],
    'Tincture (volume - each)': ['oz_measure_from_product_name'],
    'Flower (packaged - each)': ['letter_gram_measure_from_product_name', 'gram_measure_from_product_name'],
    'Topical (weight - each)': ['oz_measure_from_product_name'],
    'Capsule (weight - each)': [],
    'Infused (non-edible)': [],
    'Topical (volume - each)': ['letter_gram_measure_from_product_name', 'gram_measure_from_product_name', 'oz_measure_from_product_name'],
    'Infused Beverage': [],
    'Shake (Packaged Quarter - each)': [],
    'Shake (Packaged Half Ounce - each)': ['letter_gram_measure_from_product_name', 'gram_measure_from_product_name'],
    'Shake (Packaged Gram - each)': [],
    'Shake (Packaged Eighth - each)': [],
    'Other Concentrate (volume - each)': [],
    'Tincture (weight - each)': [],
    'Shake (Packaged Ounce - each)': [],
    'Extract (volume - each)': ['letter_gram_measure_from_product_name', 'gram_measure_from_product_name'],
    'Infused Butter/Oil (weight - each)': [],
    'Seeds': [],
    'Seeds (each)': [],
    'Clone - Cutting': [],
    'Flower (packaged half ounce - each)': [],
    'Flower (packaged ounce - each)': [],
    'Flower (packaged quarter - each)': [],
    'Immature Plants': [],
    'Infused Butter/Oil (volume - each)': [],
    'Other Concentrate (weight - each)': [],
}
