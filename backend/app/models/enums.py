from enum import Enum


class StringEnum(str, Enum):
    pass


class Role(StringEnum):
    ADMIN = "ADMIN"
    AGENT = "AGENT"
    EMPLOYEE = "EMPLOYEE"


class Department(StringEnum):
    IT = "IT"
    HR = "HR"
    FINANCE = "FINANCE"
    ADMINISTRATION = "ADMINISTRATION"


class Priority(StringEnum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class TicketStatus(StringEnum):
    OPEN = "OPEN"
    ASSIGNED = "ASSIGNED"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"
    REJECTED = "REJECTED"
