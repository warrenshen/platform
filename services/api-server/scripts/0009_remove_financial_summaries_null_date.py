import os
import sys
from os import path
from typing import cast

from sqlalchemy.orm.session import Session

# Path hack before we try to import bespoke
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../src")))
from bespoke.db import models


def remove_financial_summaries_null_date(session: Session) -> None:
	print(f'Removing financial summaries with null date...')

	financial_summaries = cast(
		models.FinancialSummary,
		session.query(models.FinancialSummary).filter(
			models.FinancialSummary.date == None
		).all())
	financial_summaries_count = len(financial_summaries)

	for financial_summary in financial_summaries:
		session.delete(financial_summary)

	print(f'Removed {financial_summaries_count} financial summaries with null date')

def main() -> None:
	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	with models.session_scope(session_maker) as session:
		remove_financial_summaries_null_date(session)

if __name__ == "__main__":
	if not os.environ.get("DATABASE_URL"):
		print("You must set 'DATABASE_URL' in the environment to use this script")
		exit(1)
	main()
