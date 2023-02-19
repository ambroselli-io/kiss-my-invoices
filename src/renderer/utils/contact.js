import { countries } from "./countries";

export const genericEmailTemplate = `Hello {client.contact_name},

I hope this email finds you well. Attached you will find the invoice for the work completed on {invoice.title}.
Please let me know if you have any questions or concerns regarding the invoice.

Thank you for your business and I look forward to working with you again in the future.

Have a nice day,

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯
{me.contact_name}
{me.description}
{me.organisation_name}
{me.email}
{me.phone}
{me.website}
`;

export const genericEmailTemplateSubject = `Invoice {invoice.invoice_number} for {invoice.title}`;

const computeEmailTemplate = ({ template, client, invoice, me }) => {
  return template
    .replace(/{client.organisation_name}/g, client.organisation_name)
    .replace(/{client.code}/g, client.code)
    .replace(/{client.address}/g, client.address)
    .replace(/{client.city}/g, client.city)
    .replace(/{client.zip}/g, client.zip)
    .replace(/{client.country}/g, countries.find((c) => c.code === client.country_code)?.country)
    .replace(/{client.contact_name}/g, client.contact_name)
    .replace(/{client.phone}/g, client.phone)
    .replace(/{me.organisation_name}/g, me.organisation_name)
    .replace(/{me.organisation_number}/g, me.organisation_number)
    .replace(/{me.vat_number}/g, me.vat_number)
    .replace(/{me.address}/g, me.address)
    .replace(/{me.city}/g, me.city)
    .replace(/{me.zip}/g, me.zip)
    .replace(/{me.country}/g, countries.find((c) => c.code === me.country_code)?.country)
    .replace(/{me.contact_name}/g, me.contact_name)
    .replace(/{me.email}/g, me.email)
    .replace(/{me.phone}/g, me.phone)
    .replace(/{me.website}/g, me.website)
    .replace(/{me.description}/g, me.description)
    .replace(/{invoice.title}/g, invoice.title)
    .replace(/{invoice.invoice_number}/g, invoice.invoice_number)
    .replace(/{invoice.emission_date}/g, invoice.emission_date)
    .replace(/{invoice.due_date}/g, invoice.due_date)
    .replace(/{invoice.amount}/g, invoice.amount);
};

export const computeEmailBody = ({ settings, client, invoice, me }) => {
  const template = settings.generic_email_template_body || genericEmailTemplate;
  return computeEmailTemplate({ template, client, invoice, me });
};

export const computeEmailSubject = ({ settings, client, invoice, me }) => {
  const template = settings.generic_email_template_subject || genericEmailTemplateSubject;
  return computeEmailTemplate({ template, client, invoice, me });
};
