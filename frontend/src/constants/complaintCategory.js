export const COMPLAINT_CATEGORY = {
  NETWORK_SERVICE_QUALITY: 'Network Service Quality',
  FRAUD_SCAM_SECURITY: 'Fraud, Scam & Security',
  BILLING_CHARGES: 'Billing & Charges',
  SERVICE_PROVISIONING: 'Service Provisioning',
  DIGITAL_ONLINE_SERVICES: 'Digital & Online Services',
};

export const COMPLAINT_CATEGORY_OPTIONS = [
  {
    value: COMPLAINT_CATEGORY.NETWORK_SERVICE_QUALITY,
    label: 'Network Service Quality',
    color: 'var(--category-network-service-quality)',
  },
  {
    value: COMPLAINT_CATEGORY.FRAUD_SCAM_SECURITY,
    label: 'Fraud, Scam & Security',
    color: 'var(--category-fraud-scam-security)',
  },
  {
    value: COMPLAINT_CATEGORY.BILLING_CHARGES,
    label: 'Billing & Charges',
    color: 'var(--category-billing-charges)',
  },
  {
    value: COMPLAINT_CATEGORY.SERVICE_PROVISIONING,
    label: 'Service Provisioning',
    color: 'var(--category-service-provisioning)',
  },
  {
    value: COMPLAINT_CATEGORY.DIGITAL_ONLINE_SERVICES,
    label: 'Digital & Online Services',
    color: 'var(--category-digital-online-services)',
  },
];

export const COMPLAINT_CATEGORY_VALUES = Object.values(COMPLAINT_CATEGORY);

const CATEGORY_MAP = new Map(COMPLAINT_CATEGORY_OPTIONS.map((opt) => [opt.value, opt]));

export function getCategoryMeta(value) {
  return CATEGORY_MAP.get(value) ?? { value, label: value };
}
