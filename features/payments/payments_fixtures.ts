export const samplePaymentsResponse = {
  items: [
    {
      id: 1,
      external_payment_id: "pay_1001",
      external_reference: "MP-REF-45891",
      purpose: "deposit",
      status: "approved",
      service_proposal_id: 101,
      work_order_id: null,
      consumer: {
        id: 1,
        name: "María Gómez",
        email: "maria.gomez@example.com",
      },
      provider: {
        id: 2,
        name: "Carlos Plomero",
        email: "carlos.plomero@example.com",
      },
      currency: "ARS",
      service_amount_cents: 2000000,
      seller_amount_cents: 1700000,
      platform_fee_cents: 300000,
      total_amount_cents: 2000000,
      created_at: "2026-09-20T10:00:00Z",
      verified_at: "2026-09-20T10:05:00Z",
    },
    {
      id: 2,
      external_payment_id: "pay_1002",
      external_reference: "MP-REF-45892",
      purpose: "balance",
      status: "approved",
      service_proposal_id: null,
      work_order_id: 201,
      consumer: {
        id: 3,
        name: "Juan Pérez",
        email: "juan.perez@example.com",
      },
      provider: {
        id: 4,
        name: "Ana Electricista",
        email: "ana.electricista@example.com",
      },
      currency: "ARS",
      service_amount_cents: 5000000,
      seller_amount_cents: 4250000,
      platform_fee_cents: 750000,
      total_amount_cents: 5000000,
      created_at: "2026-09-21T15:30:00Z",
      verified_at: "2026-09-21T15:35:00Z",
    },
  ],
  pagination: {
    page: 1,
    limit: 10,
    total: 2,
    total_pages: 1,
  },
};

export const samplePendingPaymentResponse = {
  items: [
    {
      id: 3,
      external_payment_id: "pay_pending_1003",
      external_reference: "MP-REF-45893",
      purpose: "deposit",
      status: "pending",
      service_proposal_id: 103,
      work_order_id: null,
      consumer: {
        id: 5,
        name: "Valeria Rossi",
        email: "valeria.rossi@example.com",
      },
      provider: {
        id: 6,
        name: "Esteban Carpintero",
        email: "esteban.carpintero@example.com",
      },
      currency: "ARS",
      service_amount_cents: 3500000,
      seller_amount_cents: 2975000,
      platform_fee_cents: 525000,
      total_amount_cents: 3500000,
      created_at: "2026-09-22T11:00:00Z",
      verified_at: null,
    },
  ],
  pagination: {
    page: 1,
    limit: 10,
    total: 1,
    total_pages: 1,
  },
};

export const sampleMultiplePaymentsResponse = {
  items: [
    samplePaymentsResponse.items[0],
    samplePaymentsResponse.items[1],
    samplePendingPaymentResponse.items[0],
  ],
  pagination: {
    page: 1,
    limit: 10,
    total: 3,
    total_pages: 1,
  },
};
