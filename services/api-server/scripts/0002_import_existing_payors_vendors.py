import os
import sys
from os import path
from typing import Any, Dict, List, Tuple, Union, cast

from sqlalchemy.orm.session import Session

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), '../src')))

from bespoke.date import date_util
from bespoke.db import models
from bespoke.db.db_constants import CompanyType

# customer_identifier, customer_name, company_type, company_contract_name, company_name, company_dba_1, company_dba_2
NEW_PAYOR_VENDOR_TUPLES = [
	('5MIL', '5MIL', 'Vendor', '164 Buck, LLC', '164 Buck', '', ''),
	('5MIL', '5MIL', 'Vendor', 'Alamos Farm, Inc', 'Alamos Farm', '', ''),
	('5MIL', '5MIL', 'Vendor', 'Autumn Brands, LLC', 'Autumn Brands', '', ''),
	('5MIL', '5MIL', 'Vendor', 'Bandwagon Gardens, LLC', 'Bandwagon Gardens', '', ''),
	('5MIL', '5MIL', 'Vendor', 'Bosim 1628 Management Company LLC', 'Bosim 1628 Management Company', '', ''),
	('5MIL', '5MIL', 'Vendor', 'Cali Consulting Inc.', 'Cali Consulting', 'Mediedibles', 'Rincon Ranch'),
	('5MIL', '5MIL', 'Vendor', 'CaliDutch Inc.', 'CaliDutch', '', ''),
	('5MIL', '5MIL', 'Vendor', 'California Paradise', 'California Paradise', '', ''),
	('5MIL', '5MIL', 'Vendor', 'Casahumboldt Inc', 'Casahumboldt', '', ''),
	('5MIL', '5MIL', 'Vendor', 'Castle Ridge LLC', 'Castle Ridge', '', ''),
	('5MIL', '5MIL', 'Vendor', 'CEA Development, LLC', 'CEA Development', '', ''),
	('5MIL', '5MIL', 'Vendor', 'Ceres Farms LLC', 'Ceres Farms', '', ''),
	('5MIL', '5MIL', 'Vendor', 'Clear Creek Farms, LLC', 'Clear Creek Farms', '', ''),
	('5MIL', '5MIL', 'Vendor', 'Clocktower Enterprises, Inc', 'Clocktower Enterprises', '', ''),
	('5MIL', '5MIL', 'Vendor', 'Coastal Farms LLC', 'Coastal Farms', '', ''),
	('5MIL', '5MIL', 'Vendor', 'Emerald Hearts Farm', 'Emerald Hearts Farm', 'Monterey Botanicals', ''),
	('5MIL', '5MIL', 'Vendor', 'ETMG', 'ETMG', 'Bear Extraction', ''),
	('5MIL', '5MIL', 'Vendor', 'Farfalle LLC', 'Farfalle', '', ''),
	('5MIL', '5MIL', 'Vendor', 'FLRish Farms Cultivation 2', 'FLRish Farms Cultivation 2', 'Harborside', ''),
	('5MIL', '5MIL', 'Vendor', 'GBH Distributors', 'GBH Distributors', '', ''),
	('5MIL', '5MIL', 'Vendor', 'Green Apple Glen LLC', 'Green Apple Glen', '', ''),
	('5MIL', '5MIL', 'Vendor', 'Green Ox ', 'Green Ox', '', ''),
	('5MIL', '5MIL', 'Vendor', 'Hank Carl, Damon Stewart, Ben Norton', 'Reroc Cannabis', '', ''),
	('5MIL', '5MIL', 'Vendor', 'Harvest Pacific, Inc', 'Harvest Pacific', '', ''),
	('5MIL', '5MIL', 'Vendor', 'Healy & Associates, LLC', 'Healy & Associates', 'Los Alamos Gardens', ''),
	('5MIL', '5MIL', 'Vendor', 'HEB Management I', 'HEB Management I', '', ''),
	('5MIL', '5MIL', 'Vendor', 'Honeydew Valley Farms', 'Honeydew Valley Farms', '', ''),
	('5MIL', '5MIL', 'Vendor', 'Humboldt Distribution Company', 'Humboldt Distribution Company', '', ''),
	('5MIL', '5MIL', 'Vendor', 'Humboldt Emerald Triangle LLC', 'Humboldt Emerald Triangle', 'Cirrus Management', ''),
	('5MIL', '5MIL', 'Vendor', 'Indigo Holdings, LLC', 'Indigo Holdings', '', ''),
	('5MIL', '5MIL', 'Vendor', 'Leschem Enterprises LLC', 'Leschem Enterprises', '818 Brands', ''),
	('5MIL', '5MIL', 'Vendor', 'Lily\'s Green Garden Inc', 'Lilys Green Garden', '', ''),
	('5MIL', '5MIL', 'Vendor', 'LSB Enterprise', 'LSB Enterprise', 'Wave Rider Nursery', ''),
	('5MIL', '5MIL', 'Vendor', 'Mattole Valley Organics', 'Mattole Valley Organics', 'Mattole Valley Sungrown', ''),
	('5MIL', '5MIL', 'Vendor', 'Mindfullness Farms Inc', 'Mindfullness Farms', '', ''),
	('5MIL', '5MIL', 'Vendor', 'Mission Health Associates', 'Mission Health Associates', 'Glass House', ''),
	('5MIL', '5MIL', 'Vendor', 'Monterey Tilth LLC', 'Monterey Tilth', '', ''),
	('5MIL', '5MIL', 'Vendor', 'NCG Management I, LLC', 'NCG Management I', '', ''),
	('5MIL', '5MIL', 'Vendor', 'Pacific Roots Cannabis', 'Pacific Roots Cannabis', '', ''),
	('5MIL', '5MIL', 'Vendor', 'Paet Real Estate, LLC', 'Paet Real Estate', '', ''),
	('5MIL', '5MIL', 'Vendor', 'Peak Industries Inc.', 'Peak Industries', '', ''),
	('5MIL', '5MIL', 'Vendor', 'Penne LLC', 'Penne', '', ''),
	('5MIL', '5MIL', 'Vendor', 'Primetime Farms, Inc', 'Primetime Farms', '', ''),
	('5MIL', '5MIL', 'Vendor', 'Rainmaker Properties LLC', 'Rainmaker Properties', '', ''),
	('5MIL', '5MIL', 'Vendor', 'Rigatoni LLC', 'Rigatoni', '', ''),
	('5MIL', '5MIL', 'Vendor', 'Rosette Labworks, LLC', 'Rosette Labworks', '', ''),
	('5MIL', '5MIL', 'Vendor', 'Salman Properties LLC', 'Salman Properties', '', ''),
	('5MIL', '5MIL', 'Vendor', 'Southwest LLC', 'Southwest', '', ''),
	('5MIL', '5MIL', 'Vendor', 'Sunshine Organics Greens, Inc', 'Sunshine Organics Greens', '', ''),
	('5MIL', '5MIL', 'Vendor', 'TCP 1150 LLC', 'TCP 1150', '', ''),
	('5MIL', '5MIL', 'Vendor', 'TO California LLC', 'TO California LLC', 'Tikun Olam Adelato', ''),
	('5MIL', '5MIL', 'Vendor', 'TTF Inc', 'TTF', 'Talking Tree Farms', ''),
	('5MIL', '5MIL', 'Vendor', 'Valley Crest Farms, LLC', 'Valley Crest Farms', '', ''),
	('5MIL', '5MIL', 'Vendor', 'Yager Creek Farm, LLC', 'Yager Creek Farm', 'Patterson Flat', 'Source Nursery'),
	('5MIL', '5MIL', 'Vendor', 'Zen Ridge Farm, LLC', 'Zen Ridge Farm', '', ''),
	('ACT', 'Accentian', 'Vendor', 'B Squared Management', 'B Squared Management', '', ''),
	('ACT', 'Accentian', 'Vendor', 'Leshem Enterprises', 'Leshem Enterprises', '', ''),
	('BD', 'Buddies', 'Vendor', 'CuraLeaf', 'CuraLeaf', '', ''),
	('BD', 'Buddies', 'Vendor', 'DNA Organics, Inc.', 'DNA Organics', '', ''),
	('BD', 'Buddies', 'Vendor', 'Heirloom Valley LLC', 'Heirloom Valley', '', ''),
	('BD', 'Buddies', 'Vendor', 'NorCal Distribution Solutions LLC', 'NorCal Distribution Solutions', '', ''),
	('CAN', 'Cannary', 'Vendor', 'Happy Solution Technology LTD', 'Happy Solution Technology', '', ''),
	('CAN', 'Cannary', 'Vendor', 'Shenzhen VapeEZ Technology LTD', 'Shenzhen VapeEZ Technology', '', ''),
	('CAN', 'Cannary', 'Vendor', 'SRD Technology Limited', 'SRD Technology', '', ''),
	('DF', 'Dreamfields', 'Vendor', 'Bloom Management Group', 'Bloom Management Group', '', ''),
	('DF', 'Dreamfields', 'Vendor', 'Bloom Network', 'Bloom Network', '', ''),
	('DF', 'Dreamfields', 'Vendor', 'BRH International Inc.', 'BRH International', 'Hara Supply', ''),
	('DF', 'Dreamfields', 'Vendor', 'Bulk Natural LLC', 'Bulk Natural', 'True Terpenes', ''),
	('DF', 'Dreamfields', 'Vendor', 'Cinton Inc.', 'Cinton', 'West Coast Labels', ''),
	('DF', 'Dreamfields', 'Vendor', 'Dongguan Better Electronics Technology Co Ltd', 'Dongguan Better Electronics Technology', '', ''),
	('DF', 'Dreamfields', 'Vendor', 'eBottles', 'ebottles', '', ''),
	('DF', 'Dreamfields', 'Vendor', 'Emmi World Management, LLC', 'Emmi World Management', 'Cannamsterdam', ''),
	('DF', 'Dreamfields', 'Vendor', 'GFDistribution', 'GFDistribution', 'Shelf Life', ''),
	('DF', 'Dreamfields', 'Vendor', 'Global Packaging Co.', 'Global Packaging', '', ''),
	('DF', 'Dreamfields', 'Vendor', 'Grizzly Peak Farms', 'Grizzly Peak Farms', '', ''),
	('DF', 'Dreamfields', 'Vendor', 'Innovus Print Shop', 'Innovus Print Shop', '', ''),
	('DF', 'Dreamfields', 'Vendor', 'Kanna Kingdom', 'Kanna Kingdom', '', ''),
	('DF', 'Dreamfields', 'Vendor', 'Muskrat LLC', 'Muskrat', '', ''),
	('DF', 'Dreamfields', 'Vendor', 'Nantong Oumeijia Packaging Products Co.', 'Nantong Oumeijia Packaging Products', 'Nantong Packaging', ''),
	('DF', 'Dreamfields', 'Vendor', 'Ocean Park Holdings', 'Ocean Park Holdings', '', ''),
	('DF', 'Dreamfields', 'Vendor', 'PT TRPC Manufacturing Indonesia', 'PT TRPC Manufacturing Indonesia', 'The Rolling Paper', ''),
	('DF', 'Dreamfields', 'Vendor', 'Rareb1rd LLC', 'Rareb1Rd', '', ''),
	('DF', 'Dreamfields', 'Vendor', 'Robertson Caregivers Beverlywood', 'Robertson Caregivers Beverlywood', '', ''),
	('DF', 'Dreamfields', 'Vendor', 'SoCal Labs, LLC', 'SoCal Labs', '', ''),
	('DF', 'Dreamfields', 'Vendor', 'Tissue Culture Consultants', 'Tissue Culture Consultants', 'Crown Og', ''),
	('DF', 'Dreamfields', 'Vendor', 'VBR DHS Management LLC', 'VBR DHS Management', 'High Life Farms', ''),
	('DF', 'Dreamfields', 'Vendor', 'Veda Distribution LLC', 'Veda Distribution', '', ''),
	('DF', 'Dreamfields', 'Vendor', 'We Care Cat City, Inc.', 'We Care Cat City', 'Guide Groups', ''),
	('DF', 'Dreamfields', 'Vendor', 'Wrealm LLC', 'Wrealm', 'Green Rocket', ''),
	('EP', 'EPOD', 'Vendor', 'Autumn Brands, LLC', 'Autumn Brands', '', ''),
	('EP', 'EPOD', 'Vendor', 'New Age Care Center Inc.', 'New Age Care Center', '', ''),
	('EP', 'EPOD', 'Vendor', 'Pura Vida Inc', 'Pura Vida', '', ''),
	('FL', 'Floramye', 'Vendor', 'New York Hemp Oil', 'New York Hemp Oil', '', ''),
	('FL', 'Floramye', 'Vendor', 'Organic Infusions Inc', 'Organic Infusions', '', ''),
	('GT', 'Good Tree', 'Vendor', '9701 Enterprises, Inc.', '9701 Enterprises', '', ''),
	('GT', 'Good Tree', 'Vendor', 'Big Tree', 'Big Tree', '', ''),
	('GT', 'Good Tree', 'Vendor', 'High Caliber Organics, Inc.', 'High Caliber Organics', '', ''),
	('GT', 'Good Tree', 'Vendor', 'Ironworks Collective, Inc.', 'Ironworks Collective', 'Stiiizy', ''),
	('GT', 'Good Tree', 'Vendor', 'NW Confections CA, LLC', 'NW Confections CA', '', ''),
	('GT', 'Good Tree', 'Vendor', 'PWN Management LLC', 'PWN Management', 'Pacific Wholesale Network', ''),
	('GT', 'Good Tree', 'Vendor', 'Quarry Farm LLC', 'Quarry Farm', 'SPARC', ''),
	('GT', 'Good Tree', 'Vendor', 'R&R Connect, Inc.', 'R&R Connect', 'R&R Goods', ''),
	('GT', 'Good Tree', 'Vendor', 'Sisu Extraction, LLC', 'Sisu Extraction', 'Sisu Extracts', ''),
	('GT', 'Good Tree', 'Vendor', 'TFF Agriculture LLC', 'TFF Agriculture', '', ''),
	('GT', 'Good Tree', 'Vendor', 'WCC MGMT LLC', 'WCC MGMT', 'West Coast Cure', ''),
	('HSW', 'Heaven Scent Health and Wellness', 'Vendor', 'Bison Extracts Inc', 'Bison Extracts', '', ''),
	('HG', 'Herer Group', 'Payor', 'The Medicine Woman Group LLC', 'The Medicine Woman Group', 'Lava Distribution', ''),
	('HG', 'Herer Group', 'Payor', 'Abstrax Tech', 'Abstrax Tech', '', ''),
	('HTC', 'HTC', 'Vendor', 'Coachella Distribution Co.', 'Coachella Distribution', '', ''),
	('HTC', 'HTC', 'Vendor', 'Palomar Works, Inc.', 'Palomar Works', '', ''),
	('JC', 'JC Rad', 'Vendor', 'Green Acres Group', 'Green Acres Group', '', ''),
	('KN', 'Kat\'s Naturals', 'Vendor', 'American Hemp Distributor', 'American Hemp Distributor', '', ''),
	('KN', 'Kat\'s Naturals', 'Vendor', 'Tennessee Harvester, LLC', 'Tennessee Harvester', '', ''),
	('LU', 'Leune', 'Vendor', 'Hum Made, Inc', 'Hum Made', '', ''),
	('LU', 'Leune', 'Vendor', 'Kim International Corporation', 'Kim International', 'Kush Supply', ''),
	('LU', 'Leune', 'Vendor', 'Ninja Supply Corporation', 'Ninja Supply', 'Cartridge Supply', ''),
	('LU', 'Leune', 'Vendor', 'Pax Labs, Inc.', 'Pax Labs', '', ''),
	('LU', 'Leune', 'Vendor', 'R&R Connect, Inc.', 'R&R Connect', 'R&R Goods', ''),
	('LU', 'Leune', 'Vendor', 'Utopia Manufacturing, Inc', 'Utopia Manufacturing', '', ''),
	('LU', 'Leune', 'Vendor', 'Vets Leaf', 'Vets Leaf', '', ''),
	('LC', 'Lobo Cannagar', 'Vendor', 'Highwaymen Supply and Packaging', 'Highwaymen Supply And Packaging', 'Custom Cones USA', ''),
	('LC', 'Lobo Cannagar', 'Vendor', 'J & C Founders', 'J & C Founders', '', ''),
	('LC', 'Lobo Cannagar', 'Vendor', 'PLNT Labs', 'PLNT Labs', 'Flora And Flame', ''),
	('LC', 'Lobo Cannagar', 'Vendor', 'Type 7 Manufacturing, INC', 'Type 7 Manufacturing', '', ''),
	('LL', 'Luminescence Labs', 'Vendor', 'Eternal Boom Group Co., Limited', 'Eternal Boom Group', '', ''),
	('LL', 'Luminescence Labs', 'Vendor', 'McCanBiz LLC', 'McCanBiz', 'Humble Farms', ''),
	('PV', 'Pioneer Valley', 'Vendor', 'Cultivate Holdings, LLC', 'Cultivate Holdings', '', ''),
	('PC', 'Pura Cali', 'Payor', 'Brand New Concepts LLC', 'Brand New Concepts', '', ''),
	('PC', 'Pura Cali', 'Payor', 'BZL Manufacturing Corp', 'BZL Manufacturing', '', ''),
	('PC', 'Pura Cali', 'Payor', 'Gold Flora Capital', 'Gold Flora Capital', 'Shelf Life', ''),
	('PC', 'Pura Cali', 'Payor', 'Kiva', 'Kiva', '', ''),
	('RA', 'Royal Apothecary', 'Vendor', '420-3 LLC', '420-3', 'Better Distribution', ''),
	('RA', 'Royal Apothecary', 'Vendor', '9701 Enterprises, Inc.', '9701 Enterprises', '', ''),
	('RA', 'Royal Apothecary', 'Vendor', 'Abarke (Tianjin) Technology Co., Ltd.', 'Abarke (Tianjin) Technology', '', ''),
	('RA', 'Royal Apothecary', 'Vendor', 'Aureum Labs', 'Aureum Labs', '', ''),
	('RA', 'Royal Apothecary', 'Vendor', 'Best Grinder LLC', 'Best Grinder', '', ''),
	('RA', 'Royal Apothecary', 'Vendor', 'Connected Transportation Partners', 'Connected Transportation Partners', 'Clonbar', ''),
	('RA', 'Royal Apothecary', 'Vendor', 'Gold Coast Enterprises', 'Gold Coast Enterprises', '', ''),
	('RA', 'Royal Apothecary', 'Vendor', 'LCISM Corp', 'LCISM', 'Kiva', 'Sightglass Management'),
	('RA', 'Royal Apothecary', 'Vendor', 'WCC MGMT LLC', 'WCC MGMT', 'West Coast Cure', ''),
	('SD', 'SD Strains', 'Vendor', 'Cathedral Green', 'Cathedral Green', '', ''),
	('SC', 'Space Coyote', 'Vendor', 'Artisan Canna Cigars, LLC', 'Artisan Canna Cigars', '', ''),
	('SC', 'Space Coyote', 'Vendor', 'Belo, Inc.', 'Belo', '', ''),
	('SC', 'Space Coyote', 'Vendor', 'CA Manufacturing Solutions', 'CA Manufacturing Solutions', '', ''),
	('SC', 'Space Coyote', 'Vendor', 'Canal I, LLC', 'Canal I', '', ''),
	('SC', 'Space Coyote', 'Vendor', 'CanRemediate, LLC', 'Canremediate', '', ''),
	('SC', 'Space Coyote', 'Vendor', 'Humboldt Partner Group, Inc', 'Humboldt Partner Group', 'Altum Mind', ''),
	('SC', 'Space Coyote', 'Vendor', 'IO7 Management 6448', 'Io7 Management 6448', '', ''),
	('SC', 'Space Coyote', 'Vendor', 'Joy Ridge Ventures, LLC', 'Joy Ridge Ventures', '', ''),
	('SC', 'Space Coyote', 'Vendor', 'Kind Op Corp', 'Kind Op', 'Possibl', ''),
	('SC', 'Space Coyote', 'Vendor', 'Mission Health Associates', 'Mission Health Associates', 'Glass House', ''),
	('SC', 'Space Coyote', 'Vendor', 'Ms. Parker\'s Flowers', 'Ms. Parker\'s Flowers', '', ''),
	('SC', 'Space Coyote', 'Vendor', 'Natura Management, LLC', 'Natura Management', '', ''),
	('SC', 'Space Coyote', 'Vendor', 'Outdoor Gardens LLC', 'Outdoor Gardens', '', ''),
	('SC', 'Space Coyote', 'Vendor', 'Peak Industries Inc.', 'Peak Industries', '', ''),
	('SC', 'Space Coyote', 'Vendor', 'Pure CA, LLC', 'Pure CA', 'Moxie', ''),
	('SC', 'Space Coyote', 'Vendor', 'PWN Management LLC', 'PWN Management', 'Pacific Wholesale Network', ''),
	('SC', 'Space Coyote', 'Vendor', 'S&B Water Inc.', 'S&B Water', '', ''),
	('SC', 'Space Coyote', 'Vendor', 'Sticky Fields, Inc.', 'Sticky Fields', '', ''),
	('SC', 'Space Coyote', 'Vendor', 'Town Buds LLC', 'Town Buds', 'H2Distro', ''),
	('SC', 'Space Coyote', 'Vendor', 'Whitethorn Valley Farm', 'Whitethorn Valley Farm', '', ''),
	('SC', 'Space Coyote', 'Vendor', 'Wrealm LLC', 'Wrealm', 'Green Rocket', ''),
	('AC', 'The Adventure Challenge', 'Vendor', 'Lomographic Corp', 'Lomographic', '', ''),
	('31L', 'ThirtyOne Labs', 'Vendor', 'Hum Made, Inc', 'Hum Made', '', ''),
	('31L', 'ThirtyOne Labs', 'Vendor', 'PHC Facilities, Inc.', 'PHC Facilities', 'Evergreen Distro', ''),
	('31L', 'ThirtyOne Labs', 'Vendor', 'Seven Zero Seven LLC', 'Seven Zero Seven', 'Boxcar Seven', ''),
	('31L', 'ThirtyOne Labs', 'Vendor', 'Sunfed, INC', 'Sunfed', '', ''),
	('31L', 'ThirtyOne Labs', 'Vendor', 'Swan Bay Solutions, Inc', 'Swan Bay Solutions', 'T Rex Distro', ''),
	('VOY', 'Voyage', 'Vendor', 'All Seasons Holdings', 'All Seasons Holdings', 'Gentlemans Cut', ''),
	('VOY', 'Voyage', 'Vendor', 'Kristal Graphics', 'Kristal Graphics', '', ''),
	('VOY', 'Voyage', 'Vendor', 'Partake, LLC', 'Partake', '', ''),
	('VOY', 'Voyage', 'Vendor', 'RW Ventures, LLC', 'RW Ventures', 'Cover Label', ''),
	('GP', 'Greenleaf', 'Payor', 'LBS Distribution', 'LBS Distribution', '', ''),
	('BIS', 'Biscotti', 'Payor', 'Filigreen', 'Filigreen', '', ''),
	('DR', 'Desert Road', 'Payor', 'MedMen', 'MedMen', '', ''),
	('HF', 'Humboldt Farms', 'Payor', 'Fume Highroad Napa', 'Fume Highroad Napa', '', ''),
	('HF', 'Humboldt Farms', 'Payor', 'Greenwolf', 'Greenwolf', '', ''),
	('HF', 'Humboldt Farms', 'Payor', 'Caliva SJ', 'Caliva SJ', '', ''),
	('HF', 'Humboldt Farms', 'Payor', 'Caliva Brisbane', 'Caliva Brisbane', '', ''),
	('HF', 'Humboldt Farms', 'Payor', 'The Green Goddess', 'The Green Goddess', '', ''),
	('HF', 'Humboldt Farms', 'Payor', 'From the Earth Ventura', 'From the Earth Ventura', '', ''),
	('HF', 'Humboldt Farms', 'Payor', 'Superior Herbal Health', 'Superior Herbal Health', '', ''),
	('HF', 'Humboldt Farms', 'Payor', 'From the Earth Santa Ana', 'From the Earth Santa Ana', '', ''),
	('HF', 'Humboldt Farms', 'Payor', 'Embarc', 'Embarc', '', ''),
	('HF', 'Humboldt Farms', 'Payor', 'Indigo', 'Indigo', '', ''),
	('HF', 'Humboldt Farms', 'Payor', 'Natoma East Bay', 'Natoma East Bay', '', ''),
	('HF', 'Humboldt Farms', 'Payor', 'Natoma Long Beach', 'Natoma Long Beach', '', ''),
	('HF', 'Humboldt Farms', 'Payor', 'Natoma San Francisco', 'Natoma San Francisco', '', ''),
	('HF', 'Humboldt Farms', 'Payor', 'Urbn Leaf', 'Urbn Leaf', '', ''),
	('HF', 'Humboldt Farms', 'Payor', 'Fume Cotati', 'Fume Cotati', '', ''),
	('HF', 'Humboldt Farms', 'Payor', 'Urbn Leaf ', 'Urbn Leaf ', '', ''),
	('GF', 'Grupo Flor', 'Payor', 'Emerald City', 'MedMen SD', '', ''),
	('GF', 'Grupo Flor', 'Payor', 'Telos CG Management', 'Telos CG Management', '', ''),
	('GF', 'Grupo Flor', 'Payor', 'MedMen SD', 'MedMen SD', '', ''),
	('GF', 'Grupo Flor', 'Payor', 'Green Goddess Collective', 'Green Goddess Collective', '', ''),
	('GF', 'Grupo Flor', 'Payor', 'From the Earth Santa Ana', 'From the Earth Santa Ana', '', ''),
	('GF', 'Grupo Flor', 'Payor', 'Indigo ', 'Indigo ', '', ''),
	('GF', 'Grupo Flor', 'Payor', 'Natoma Long Beach', 'Natoma Long Beach', '', ''),
	('GF', 'Grupo Flor', 'Payor', 'Embarc', 'Embarc', '', ''),
	('GF', 'Grupo Flor', 'Payor', 'Superior Herbal Health', 'Superior Herbal Health', '', ''),
	('GF', 'Grupo Flor', 'Payor', 'Green Tribe Gold', 'Green Tribe Gold', '', ''),
	('GF', 'Grupo Flor', 'Payor', 'Caliva Brisbane', 'Caliva Brisbane', '', ''),
	('GF', 'Grupo Flor', 'Payor', 'Natoma San Francisco', 'Natoma San Francisco', '', ''),
	('GF', 'Grupo Flor', 'Payor', 'Urbn Leaf', 'Urbn Leaf', '', ''),
	('GF', 'Grupo Flor', 'Payor', 'Greenwolf', 'Greenwolf', '', ''),
	('GF', 'Grupo Flor', 'Payor', 'MedMen - Abbott Kinney', 'MedMen Abbott Kinney', '', ''),
	('GF', 'Grupo Flor', 'Payor', 'Caliva SJ', 'Caliva SJ', '', ''),
	('GF', 'Grupo Flor', 'Payor', 'Fume Highroad Napa', 'Fume Highroad Napa', '', ''),
	('GF', 'Grupo Flor', 'Payor', 'Wildflower', 'Wildflower', '', ''),
	('GF', 'Grupo Flor', 'Payor', 'From the Earth Ventura', 'From the Earth Ventura', '', ''),
]

def import_existing_payors_vendors(session: Session) -> None:
	payors_vendors_count = len(NEW_PAYOR_VENDOR_TUPLES)
	print(f'Creating {payors_vendors_count} payors / vendors...')

	for index, new_payor_vendor_tuple in enumerate(NEW_PAYOR_VENDOR_TUPLES):
		customer_identifier, customer_name, company_type, company_contract_name, company_name, company_dba_1, company_dba_2 = new_payor_vendor_tuple
		if (
			not customer_identifier or
			not customer_name or
			not company_type or
			not company_contract_name or
			not company_name
		):
			print(f'[{index + 1} of {payors_vendors_count}] Invalid row')
			continue

		company_type = company_type.lower()

		if company_type not in [CompanyType.Payor, CompanyType.Vendor]:
			print(f'[{index + 1} of {payors_vendors_count}] Invalid company type')
			continue

		customer = cast(
			models.Company,
			session.query(models.Company).filter(
				models.Company.company_type == CompanyType.Customer
			).filter(
				models.Company.identifier == customer_identifier
			).first())
		if not customer:
			print(f'[{index + 1} of {payors_vendors_count}] Customer with identifier {customer_identifier} does not exist')
			continue

		company = None

		existing_company_by_name = cast(
			models.Company,
			session.query(models.Company).filter(
				models.Company.name == company_name
			).first())
		if existing_company_by_name:
			if existing_company_by_name.company_type != company_type:
				print(f'[{index + 1} of {payors_vendors_count}] Company with name {company_name} exists, but is not the correct company type')
				continue
			else:
				print(f'[{index + 1} of {payors_vendors_count}] Company with name {company_name} already exists')
				company = existing_company_by_name
		else:
			print(f'[{index + 1} of {payors_vendors_count}] Company with name {company_name} does not exist, creating it...')

			company_settings = models.CompanySettings()
			session.add(company_settings)

			session.flush()
			company_settings_id = str(company_settings.id)

			dba_name = None
			if company_dba_1 and company_dba_2:
				dba_name = f'{company_dba_1}, {company_dba_2}'
			elif company_dba_1:
				dba_name = company_dba_1

			company = models.Company(
				company_settings_id=company_settings_id,
				company_type=company_type,
				name=company_name,
				contract_name=company_contract_name,
				dba_name=dba_name,
			)
			session.add(company)
			session.flush()

			company_id = str(company.id)
			company_settings.company_id = company_id
			session.flush()

			print(f'[{index + 1} of {payors_vendors_count}] Created company {company.name} ({company.company_type})')

		if company_type == CompanyType.Payor:
			existing_company_payor_partnership = cast(
				models.CompanyPayorPartnership,
				session.query(models.CompanyPayorPartnership).filter(
					models.CompanyPayorPartnership.company_id == customer.id
				).filter(
					models.CompanyPayorPartnership.payor_id == company.id,
				).first())

			if existing_company_payor_partnership:
				print(f'[{index + 1} of {payors_vendors_count}] Company payor partnership between customer {customer_name} and payor {company_name} already exists')
				if not existing_company_payor_partnership.approved_at:
					existing_company_payor_partnership.approved_at = date_util.now()
					print(f'[{index + 1} of {payors_vendors_count}] Company payor partnership between customer {customer_name} and payor {company_name} is not approved, approving it...')
			else:
				print(f'[{index + 1} of {payors_vendors_count}] Company payor partnership between customer {customer_name} and payor {company_name} does not exist, creating it...')
				company_payor_partnership = models.CompanyPayorPartnership(
					company_id=customer.id,
					payor_id=company.id,
					approved_at=date_util.now(),
				)
				session.add(company_payor_partnership)
				print(f'[{index + 1} of {payors_vendors_count}] Created company payor partnership between customer {customer_name} and payor {company_name}')

		else:
			existing_company_vendor_partnership = cast(
				models.CompanyVendorPartnership,
				session.query(models.CompanyVendorPartnership).filter(
					models.CompanyVendorPartnership.company_id == customer.id
				).filter(
					models.CompanyVendorPartnership.vendor_id == company.id,
				).first())

			if existing_company_vendor_partnership:
				print(f'[{index + 1} of {payors_vendors_count}] Company vendor partnership between customer {customer_name} and vendor {company_name} already exists')
				if not existing_company_vendor_partnership.approved_at:
					existing_company_vendor_partnership.approved_at = date_util.now()
					print(f'[{index + 1} of {payors_vendors_count}] Company payor partnership between customer {customer_name} and payor {company_name} is not approved, approving it...')
			else:
				print(f'[{index + 1} of {payors_vendors_count}] Company vendor partnership between customer {customer_name} and vendor {company_name} does not exist, creating it...')
				company_vendor_partnership = models.CompanyVendorPartnership(
					company_id=customer.id,
					vendor_id=company.id,
					approved_at=date_util.now(),
				)
				session.add(company_vendor_partnership)
				print(f'[{index + 1} of {payors_vendors_count}] Created company vendor partnership between customer {customer_name} and vendor {company_name}')

def main() -> None:
	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	with models.session_scope(session_maker) as session:
		import_existing_payors_vendors(session)

if __name__ == '__main__':
	if not os.environ.get('DATABASE_URL'):
		print("You must set 'DATABASE_URL' in the environment to use this script")
		exit(1)
	main()
