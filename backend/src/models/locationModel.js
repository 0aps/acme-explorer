import mongoose from 'mongoose';

const { Schema } = mongoose;

const CoordinateSchema = mongoose.Schema( {
  lat: {
    type: Number,
    required: 'You need to provide the lat coordinate'
  },
  long: {
    type: Number,
    required: 'You need to provide the long coordinate'
  }
}, { _id : false });

const LocationSchema = new Schema(
  {
    title: {
      type: String,
      required: 'You need to provide a title'
    },
    description: {
      type: String,
      required: 'You need to provide a description'
    },
    type: {
      type: String,
    },
    coordinates: {
      type: CoordinateSchema,
      required: 'You need to provide a coordinate'
    },
  },
  {
    timestamps: true
  }
);

export const locationModel = mongoose.model('Location', LocationSchema);
