export const party = {
  id: 1,
  name: "Ana",
  surname: "Pérez"
};
export const operation = {
  id: "jr-1",
  stage: "request_accepted",
  started_on: "2026-09-29T12:00:00Z",
  job_request: {
    id: 1,
    status: "accepted",
    created_on: "2026-09-29T12:00:00Z"
  },
  service_proposal: null,
  work_order: null,
  consumer: party,
  provider: {
    ...party,
    id: 2
  },
  category: null,
  alerts: [],
  next_action_owner: null,
  last_business_advance_on: null,
  limitations: ["request_acceptance_time_unavailable"]
};
