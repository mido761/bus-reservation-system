 export const waitingList = async (tripId,client) => {
  try {
 
 // Step 1: get trip_id from booking_id
    const {rows : tripRes} = await client.query(
      `SELECT * FROM trips WHERE trip_id = $1`,
      [tripId]
      );
    // console.log(tripRes[0]);   


    //confrim the booking in the database or put it in the waiting
    const getBookingTripQuery = `
      WITH ordered AS (
        SELECT booking_id,
              ROW_NUMBER() OVER (ORDER BY updated_at) AS rnk
        FROM booking
        WHERE trip_id = $1
          AND status NOT IN ('cancelled', 'pending','rejected')
      ),
      batched AS (
        SELECT booking_id,
              rnk,
              FLOOR((rnk - 1)::numeric / $2) AS batch_num
        FROM ordered
      ),
      batch_counts AS (
        SELECT batch_num, COUNT(*) AS cnt
        FROM batched
        GROUP BY batch_num
      ),
      full_batches AS (
        -- only batches that are exactly full (size = min_cap)
        SELECT batch_num
        FROM batch_counts
        WHERE cnt = $2
      )
      UPDATE booking b
      SET status = CASE WHEN fb.batch_num IS NOT NULL THEN 'confirmed' ELSE 'waiting' END
      FROM batched bt
      LEFT JOIN full_batches fb ON bt.batch_num = fb.batch_num
      WHERE b.booking_id = bt.booking_id
        -- <--- important: do not touch cancelled or pending rows
        AND b.status NOT IN ('cancelled', 'pending','rejected');
      ` 
    const getBookingTrip = await client.query(getBookingTripQuery, [tripId,tripRes[0].min_bus_cap]);
  } catch (err) {
    throw err;
  }
};
