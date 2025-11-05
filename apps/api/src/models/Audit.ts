import mongoose, { Schema, Document } from 'mongoose';

export interface IAudit extends Document {
  actorId: mongoose.Types.ObjectId;
  action: string;
  entity: string;
  entityId?: mongoose.Types.ObjectId;
  timestamp: Date;
  meta?: Record<string, unknown>;
}

const AuditSchema = new Schema<IAudit>(
  {
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    entity: { type: String, required: true },
    entityId: { type: Schema.Types.ObjectId },
    timestamp: { type: Date, default: Date.now },
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: false }
);

AuditSchema.index({ actorId: 1, timestamp: -1 });
AuditSchema.index({ entity: 1, entityId: 1 });

export const Audit = mongoose.model<IAudit>('Audit', AuditSchema);
