from types import SimpleNamespace
from unittest import TestCase

from fastapi import HTTPException

from app.modules.council.router import (
    get_council_members,
    vietnamese_alphabetical_key,
)
from app.modules.schedule.router import MAX_CASES_PER_ROOM_SHIFT, validate_schedule
from app.modules.schedule.schemas import ScheduleCreate


class FakeQuery:
    def __init__(self, *, count_result=0, all_result=None):
        self.count_result = count_result
        self.all_result = all_result or []

    def filter(self, *args):
        return self

    def count(self):
        return self.count_result

    def all(self):
        return self.all_result


class SequentialFakeDatabase:
    def __init__(self, queries):
        self.queries = iter(queries)

    def query(self, *args):
        return next(self.queries)


def build_schedule() -> ScheduleCreate:
    return ScheduleCreate(
        date="2026-09-07",
        room="Hội trường 1",
        shift="Sáng",
        jurors=["Hội thẩm A", "Hội thẩm B"],
        start_time="08:00:00",
        end_time="09:00:00",
        dispute_relationship="Tranh chấp hợp đồng",
        litigant="Nguyễn Văn A",
    )


class ScheduleCapacityTest(TestCase):
    def test_sixth_case_is_allowed_for_the_same_room_and_shift(self) -> None:
        database = SequentialFakeDatabase(
            [
                FakeQuery(count_result=MAX_CASES_PER_ROOM_SHIFT - 1),
                FakeQuery(all_result=[("Hội thẩm A",), ("Hội thẩm B",)]),
                FakeQuery(),
                FakeQuery(),
            ]
        )

        validate_schedule(build_schedule(), database, SimpleNamespace(id=1))

    def test_seventh_case_is_rejected_for_the_same_room_and_shift(self) -> None:
        database = SequentialFakeDatabase(
            [FakeQuery(count_result=MAX_CASES_PER_ROOM_SHIFT)]
        )

        with self.assertRaises(HTTPException) as context:
            validate_schedule(build_schedule(), database, SimpleNamespace(id=1))

        self.assertEqual(context.exception.status_code, 400)
        self.assertEqual(
            context.exception.detail,
            "Mỗi buổi, mỗi hội trường chỉ được đăng ký tối đa 6 vụ!",
        )


class CouncilMemberOrderingTest(TestCase):
    def test_vietnamese_names_are_sorted_by_given_name(self) -> None:
        names = ["Võ Thị Bích", "Lê Minh Anh", "Đặng Ngọc Thu", "Châu Thanh Tân"]

        self.assertEqual(
            sorted(names, key=vietnamese_alphabetical_key),
            ["Lê Minh Anh", "Võ Thị Bích", "Châu Thanh Tân", "Đặng Ngọc Thu"],
        )

    def test_council_endpoint_returns_alphabetical_names(self) -> None:
        members = [
            SimpleNamespace(id=4, full_name="Võ Thị Bích"),
            SimpleNamespace(id=2, full_name="Đặng Ngọc Thu"),
            SimpleNamespace(id=1, full_name="Châu Thanh Tân"),
            SimpleNamespace(id=3, full_name="Lê Minh Anh"),
        ]
        database = SequentialFakeDatabase([FakeQuery(all_result=members)])

        result = get_council_members(db=database, current_user=SimpleNamespace())

        self.assertEqual(
            [member.full_name for member in result],
            ["Lê Minh Anh", "Võ Thị Bích", "Châu Thanh Tân", "Đặng Ngọc Thu"],
        )
