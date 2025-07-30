from core.models.table_registry import table_registry

@table_registry.mapped_as_dataclass
class User:
    ...