import { Injectable } from '@nestjs/common';

@Injectable()
export class TemplateService {
  buildOutcomePendingForAdmin(data: {
    requesterName: string;
    requesterEmail: string;
    reportId: number;
    createdAt: Date;
  }): { subject: string; body: string } {
    const subject = `Nueva solicitud de retiro pendiente #${data.reportId}`;
    const body = [
      'Hola administrador,',
      '',
      `Se ha registrado una nueva solicitud de retiro #${data.reportId}.`,
      `Solicitante: ${data.requesterName} (${data.requesterEmail}).`,
      `Fecha de solicitud: ${new Date(data.createdAt).toLocaleString('es-EC', { timeZone: 'America/Guayaquil' })}.`,
      '',
      'Por favor revisa la solicitud en el modulo de reportes.',
      'Sistema SCAFAME',
    ].join('\n');

    return { subject, body };
  }

  buildOutcomeApproved(data: {
    requesterName: string;
    reportId: number;
    approvedByName: string;
    createdAt: Date;
  }): { subject: string; body: string } {
    const subject = `Solicitud de retiro aprobada #${data.reportId}`;
    const body = [
      `Hola ${data.requesterName},`,
      '',
      `Tu solicitud de retiro #${data.reportId} fue aprobada por ${data.approvedByName}.`,
      `Fecha de solicitud: ${new Date(data.createdAt).toLocaleString('es-EC', { timeZone: 'America/Guayaquil' })}.`,
      '',
      'Sistema SCAFAME',
    ].join('\n');

    return { subject, body };
  }

  buildOutcomeRejected(data: {
    requesterName: string;
    reportId: number;
    createdAt: Date;
  }): { subject: string; body: string } {
    const subject = `Solicitud de retiro rechazada #${data.reportId}`;
    const body = [
      `Hola ${data.requesterName},`,
      '',
      `Tu solicitud de retiro #${data.reportId} fue rechazada.`,
      `Fecha de solicitud: ${new Date(data.createdAt).toLocaleString('es-EC', { timeZone: 'America/Guayaquil' })}.`,
      '',
      'Si necesitas mas detalle, por favor contacta al administrador.',
      'Sistema SCAFAME',
    ].join('\n');

    return { subject, body };
  }
}
