import pkg, { RRule } from "rrule";
// Use unknown to bypass ESM interop issues safely without using 'any'
const rrulestr = (pkg as unknown as { rrulestr: (s: string) => RRule }).rrulestr;

import { startOfDay, isAfter, format } from "date-fns";

export class SlotGenerator {
  /**
   * Generates slots for a given availability rule within a date range.
   * @param rule RRULE string
   * @param startDate Start date for generation
   * @param endDate End date for generation
   * @param startTime HH:mm
   * @param endTime HH:mm
   */
  static generateSlots(
    ruleStr: string,
    startDate: Date,
    endDate: Date,
    startTimeStr: string,
    endTimeStr: string
  ): { start: Date; end: Date }[] {
    // Ensure the rule has a DTSTART if not present, otherwise between() might fail
    let finalRuleStr = ruleStr;
    if (!ruleStr.includes("DTSTART")) {
      // Use floating time (no Z) to ensure it's relative to the day, not UTC
      const dtStart = format(startOfDay(startDate), "yyyyMMdd'T'HHmmss");
      // Ensure the recurrence part is prefixed with RRULE: for valid multi-line iCalendar format
      const rrulePart = ruleStr.startsWith("RRULE:") ? ruleStr : `RRULE:${ruleStr}`;
      finalRuleStr = `DTSTART:${dtStart}\n${rrulePart}`;
    }

    const rule = rrulestr(finalRuleStr);
    
    const searchStart = startOfDay(startDate);
    const occurrences = rule.between(searchStart, endDate, true);

    const slots: { start: Date; end: Date }[] = [];
    const [startH, startM] = startTimeStr.split(":").map(Number);
    const [endH, endM] = endTimeStr.split(":").map(Number);

    occurrences.forEach((occ) => {
      const slotStart = new Date(occ);
      slotStart.setHours(startH, startM, 0, 0);

      const slotEnd = new Date(occ);
      slotEnd.setHours(endH, endM, 0, 0);

      if (isAfter(slotStart, new Date())) {
        slots.push({ start: slotStart, end: slotEnd });
      }
    });

    return slots;
  }
}
