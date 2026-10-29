"""Configuração de logging estruturado com Correlation-ID seguro."""

import logging
import sys

class SafeCorrelationFormatter(logging.Formatter):
    def format(self, record):
        if not hasattr(record, "correlation_id"):
            record.correlation_id = "SYSTEM"
        return super().format(record)

def setup_logging(level: str = "INFO"):
    handler = logging.StreamHandler(sys.stdout)
    formatter = SafeCorrelationFormatter(
        "%(asctime)s [%(levelname)s] [%(name)s] [ReqID: %(correlation_id)s] %(message)s"
    )
    handler.setFormatter(formatter)
    
    root = logging.getLogger()
    root.setLevel(level)
    # Evita duplicação de handlers
    if not root.handlers:
        root.addHandler(handler)
    else:
        root.handlers[0] = handler
