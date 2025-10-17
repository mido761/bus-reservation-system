import { DateTime } from 'luxon';

export const cancelTimeAllowance = (trip) => {

    const now = DateTime.utc();


    // Assume `bus.schedule` is in format "YYYY-MM-DD"
    // Assume `bus.departureTime` is in format "HH:mm" (e.g., "13:45")
    // Assume `bus.allowance.cancelTimeAllowance` is in milliseconds (e.g., 3600000 for 1 hour)

    // Combine date and time into full Date object
    // const fullDepartureDateTime = new Date(`${bus.schedule}T${bus.departureTime}:00`);
    const egyptDate = DateTime.fromISO(`${trip.date}T${trip.departure_time}`, {
        zone: 'Africa/Cairo',
    });
    // console.log(egyptDate)

    // Convert to UTC
    const fullDepartureDateTime = egyptDate.toUTC();

    // console.log("UTC bus:", fullDepartureDateTime);
    // console.log("UTC now:", now);


    // Calculate cutoff time (when cancellation is no longer allowed)
    // const cancelDeadline = new Date(fullDepartureDateTime - bus.allowance.cancelTimeAllowance);

    const cancelDeadline = fullDepartureDateTime.minus({ milliseconds: trip.cancel_allowance});

    console.log(`bus time   ${fullDepartureDateTime}  ,  time now   ${now}, Deadline: ${cancelDeadline}`)
    if (!isAdmin && (now > cancelDeadline)) {
        return res.status(400).json({
            message: `You can only cancel your seats before the bus by ${bus.allowance.cancelTimeAllowance / (60 * 60 * 1000)
                } hours!`,
        });
    }
}


