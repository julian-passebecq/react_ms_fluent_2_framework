-- Original V2 display-and-compare fixture; this repository does not execute it.
SELECT
  order_id,
  customer_id,
  amount,
  ROW_NUMBER() OVER (
    PARTITION BY customer_id
    ORDER BY amount DESC
  ) AS amount_rank
FROM orders;
