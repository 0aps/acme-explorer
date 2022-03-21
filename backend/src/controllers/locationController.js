import { StatusCodes } from 'http-status-codes';
import Constants from '../shared/constants.js';
import { locationModel } from '../models/locationModel.js';
import { RecordNotFound, UserForbidden } from '../shared/exceptions.js';

export const findLocations = async (req, res) => {
  let { perPage, page, sort, ...query } = req.query;
  const [field, sortType] = sort ? sort.split(',') : Constants.defaultSort;
  perPage = perPage ? parseInt(perPage) : Constants.defaultPerPage;
  page = Math.max(0, page ?? 0);

  try {
    const records = await locationModel
      .find(query)
      .skip(perPage * page)
      .limit(perPage)
      .sort({ [field]: sortType })
      .exec();
    const count = await locationModel.countDocuments();
    res.json({
      records: records,
      page: page,
      pages: count / perPage
    });
  } catch (e) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(e.message);
  }
};

export const findLocation = async (req, res, next) => {
  try {
    const { actor } = res.locals;
    const record = await locationModel.findById(req.params.locationId);

    if (!record) {
      return next(new RecordNotFound());
    }

    if (!actor.isAdmin() && record.actor.toString() !== actor._id.toString()) {
      return next(new UserForbidden());
    }

    res.json(record);
  } catch (e) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(e);
  }
};

export const createLocation = async (req, res) => {
  try {
    const newLocation = new locationModel(req.body);
    const location = await newLocation.save();
    res.status(StatusCodes.CREATED).json(location);
  } catch (e) {
    if (e) {
      if (e.name === 'ValidationError') {
        res.status(StatusCodes.UNPROCESSABLE_ENTITY).json(e);
      } else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(e);
      }
    }
  }
};

export const updateLocation = async (req, res, next) => {
  try {
    const record = await locationModel.findById(req.params.locationId);

    if (!record) {
      return next(new RecordNotFound());
    }

    const location = await locationModel.findOneAndUpdate({ _id: req.params.locationId }, req.body, { new: true });
    res.json(location);
  } catch (e) {
    if (e) {
      if (e.name === 'ValidationError') {
        res.status(StatusCodes.UNPROCESSABLE_ENTITY).json(e);
      } else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(e);
      }
    }
  }
};

export const deleteLocation = async (req, res, next) => {
  try {
    const record = await locationModel.findById(req.params.locationId);

    if (!record) {
      return next(new RecordNotFound());
    }

    await locationModel.deleteOne({ _id: req.params.locationId });
    res.sendStatus(StatusCodes.NO_CONTENT);
  } catch (e) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(e);
  }
};
