import m2s from 'mongoose-to-swagger';
import { locationModel } from '../models/locationModel.js';

export const location = m2s(locationModel, {
  omitFields: ['_id', 'createdAt', 'updatedAt']
});
