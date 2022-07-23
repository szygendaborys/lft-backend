export interface SendgridMail {
  to: string;
  from: string;
  templateId: string;
  dynamicTemplateData: Record<string, any>;
}
