from datetime import datetime, timedelta, timezone
from unittest import TestCase

from app.modules.schedule.models import VIETNAM_TIMEZONE, vietnam_now
from app.modules.schedule.schemas import ScheduleOut


class ScheduleTimezoneTest(TestCase):
    def build_schedule(self, created_at: datetime) -> ScheduleOut:
        return ScheduleOut(
            id=1,
            date="2026-08-07",
            room="Hội trường 1",
            shift="Sáng",
            jurors=["Hội thẩm A", "Hội thẩm B"],
            start_time="08:00:00",
            end_time="09:00:00",
            created_at=created_at,
            user={"id": 1, "username": "judge", "is_admin": False},
        )

    def test_vietnam_now_is_timezone_aware(self) -> None:
        current_time = vietnam_now()

        self.assertEqual(current_time.tzinfo, VIETNAM_TIMEZONE)
        self.assertEqual(current_time.utcoffset(), timedelta(hours=7))

    def test_naive_legacy_utc_timestamp_is_converted_to_vietnam(self) -> None:
        schedule = self.build_schedule(datetime(2026, 8, 7, 1, 30))

        self.assertEqual(schedule.created_at.isoformat(), "2026-08-07T08:30:00+07:00")

    def test_aware_utc_timestamp_is_converted_to_vietnam(self) -> None:
        schedule = self.build_schedule(
            datetime(2026, 8, 7, 1, 30, tzinfo=timezone.utc)
        )

        self.assertEqual(schedule.created_at.isoformat(), "2026-08-07T08:30:00+07:00")
