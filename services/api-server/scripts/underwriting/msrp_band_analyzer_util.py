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

CONFIDENCE_LEVEL = 'sd'
ERROR_STYLE = 'band'

MEASUREMENT_DICT = {
    'ounce': 28,
    'half ounce': 14,
    'quarter': 7,
    'eighth': 3.5,
    'gram': 1,
    # 'pound': 448
}

CONFIDENCE_BAND_MULTIPLIER = 1


def extract_letter_units_in_gram_ml(string):
    string = string.lower()
    if 'm' in string:
        measure = float(string.split('m')[0].strip()) * .001
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


EXTRACTED_MEASUREMENT_COLUMNS = {
    #'letter_litre_measure_from_product_name': extract_letter_units_in_gram_ml,
    'letter_gram_measure_from_product_name': extract_letter_units_in_gram_ml,
    'gram_measure_from_product_name': extract_gram_units_gram_litre,
    'oz_measure_from_product_name': extract_oz_units_gram_litre
}

TRAINING_OBJECT_NAME = 'msrp_band_analyzer_training_object'
