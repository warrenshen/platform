
from typing import List, Dict, Tuple, Any
from collections.abc import Sequence

class DataFrame(Sequence):

	columns: List[str]

	def __init__(self, *args: Any, **kwargs: Any) -> None:
		pass

	def copy(self) -> 'DataFrame':
		pass

	def isin(self, *args: Any, **kwargs: Any) -> 'DataFrame':
		pass

	def astype(self, *args: Any, **kwargs: Any) -> 'DataFrame':
		pass

	def apply(self, *args: Any, **kwargs: Any) -> Any:
		pass

	def assign(self, *args: Any, **kwargs: Any) -> Any:
		pass

	def groupby(self, *args: Any, **kwargs: Any) -> Any:
		pass

	def iterrows(self) -> Tuple[int, Any]:
		pass

	def __getitem__(self, idx: Any) -> Any:
		pass

	def __setitem__(self, idx: Any, val: Any) -> Any:
		pass

	def __len__(self) -> int:
		pass

	def to_dict(self, el: str) -> List[Dict]:
		pass

def to_datetime(df: DataFrame) -> Any:
	pass

def read_excel(filepath: str, converters: Dict) -> Any:
	pass

def read_sql_query(sql_query: str, engine: Any) -> DataFrame:
	pass