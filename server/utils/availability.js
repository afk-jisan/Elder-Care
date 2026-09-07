const AVAILABILITY_TZ = process.env.AVAILABILITY_TZ || 'Asia/Dhaka';

function localClockParts(date = new Date(), timeZone = AVAILABILITY_TZ) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const day = parts.find((p) => p.type === 'weekday')?.value || '';
  const hour = Number(parts.find((p) => p.type === 'hour')?.value || 0);
  const minute = Number(parts.find((p) => p.type === 'minute')?.value || 0);
  return { day, minutes: hour * 60 + minute, timeZone };
}

export function isDoctorAvailableNow(slots, now = new Date()) {
  const { day, minutes } = localClockParts(now);
  return slots.some((slot) => {
    if (slot.dayOfWeek !== day) return false;
    const [sh, sm] = String(slot.startTime).split(':').map(Number);
    const [eh, em] = String(slot.endTime).split(':').map(Number);
    const start = sh * 60 + sm;
    const end = eh * 60 + em;
    return minutes >= start && minutes <= end;
  });
}

export { AVAILABILITY_TZ, localClockParts };
