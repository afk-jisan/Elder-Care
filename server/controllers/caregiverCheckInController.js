import { CarePlan } from '../models/CarePlan.js';
import { Elder } from '../models/Elder.js';
import { Visit } from '../models/Visit.js';
import { distanceMeters } from '../utils/geo.js';

const MAX_DISTANCE_METERS = 50;

function visitDto(visit) {
  return {
    id: visit._id.toString(),
    caregiverId: visit.caregiverId.toString(),
    elderId: visit.elderId?._id
      ? visit.elderId._id.toString()
      : visit.elderId.toString(),
    elder: visit.elderId?.name
      ? {
          id: visit.elderId._id.toString(),
          name: visit.elderId.name,
          address: visit.elderId.address,
          latitude: visit.elderId.latitude,
          longitude: visit.elderId.longitude,
        }
      : undefined,
    carePlanId: visit.carePlanId.toString(),
    status: visit.status,
    checkInAt: visit.checkInAt,
    checkInLatitude: visit.checkInLatitude,
    checkInLongitude: visit.checkInLongitude,
    checkInDistanceMeters: visit.checkInDistanceMeters,
    checkOutAt: visit.checkOutAt,
    checkOutLatitude: visit.checkOutLatitude,
    checkOutLongitude: visit.checkOutLongitude,
    checkOutDistanceMeters: visit.checkOutDistanceMeters,
    checkOutPhotoUrl: visit.checkOutPhotoUrl,
  };
}

export async function listAssignedElders(req, res, next) {
  try {
    const plans = await CarePlan.find({
      caregiverId: req.auth.userId,
      status: 'active',
    }).populate('elderId');

    const elders = plans
      .filter((p) => p.elderId)
      .map((p) => ({
        carePlanId: p._id.toString(),
        package: p.package,
        elder: {
          id: p.elderId._id.toString(),
          name: p.elderId.name,
          address: p.elderId.address,
          latitude: p.elderId.latitude,
          longitude: p.elderId.longitude,
        },
      }));

    res.json({ assignments: elders });
  } catch (err) {
    next(err);
  }
}

export async function listVisits(req, res, next) {
  try {
    const visits = await Visit.find({ caregiverId: req.auth.userId })
      .populate('elderId', 'name address latitude longitude')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ visits: visits.map(visitDto) });
  } catch (err) {
    next(err);
  }
}

export async function getActiveVisit(req, res, next) {
  try {
    const visit = await Visit.findOne({
      caregiverId: req.auth.userId,
      status: 'checked_in',
    }).populate('elderId', 'name address latitude longitude');

    res.json({ visit: visit ? visitDto(visit) : null });
  } catch (err) {
    next(err);
  }
}

export async function checkIn(req, res, next) {
  try {
    const { elderId, latitude, longitude } = req.body;
    if (!elderId || latitude === undefined || longitude === undefined) {
      return res
        .status(400)
        .json({ message: 'Elder, latitude, and longitude are required' });
    }

    const lat = Number(latitude);
    const lng = Number(longitude);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return res.status(400).json({ message: 'Invalid coordinates' });
    }

    const existing = await Visit.findOne({
      caregiverId: req.auth.userId,
      status: 'checked_in',
    });
    if (existing) {
      return res
        .status(400)
        .json({ message: 'Already checked in. Check out first.' });
    }

    const plan = await CarePlan.findOne({
      caregiverId: req.auth.userId,
      elderId,
      status: 'active',
    });
    if (!plan) {
      return res
        .status(403)
        .json({ message: 'No active care plan for this elder' });
    }

    const elder = await Elder.findById(elderId);
    if (!elder) {
      return res.status(404).json({ message: 'Elder not found' });
    }

    const distance = distanceMeters(
      lat,
      lng,
      elder.latitude,
      elder.longitude
    );
    if (distance > MAX_DISTANCE_METERS) {
      return res.status(400).json({
        message: `Check-in rejected. You are ${Math.round(distance)} m away (max ${MAX_DISTANCE_METERS} m).`,
        distanceMeters: Math.round(distance),
      });
    }

    const visit = await Visit.create({
      caregiverId: req.auth.userId,
      elderId: elder._id,
      carePlanId: plan._id,
      status: 'checked_in',
      checkInAt: new Date(),
      checkInLatitude: lat,
      checkInLongitude: lng,
      checkInDistanceMeters: Math.round(distance),
    });

    const populated = await Visit.findById(visit._id).populate(
      'elderId',
      'name address latitude longitude'
    );

    res.status(201).json({
      message: 'Checked in successfully',
      visit: visitDto(populated),
    });
  } catch (err) {
    next(err);
  }
}

export async function checkOut(req, res, next) {
  try {
    const { latitude, longitude, photoUrl } = req.body;
    if (latitude === undefined || longitude === undefined || !photoUrl) {
      return res.status(400).json({
        message: 'Latitude, longitude, and checkout photo are required',
      });
    }

    const lat = Number(latitude);
    const lng = Number(longitude);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return res.status(400).json({ message: 'Invalid coordinates' });
    }

    const visit = await Visit.findOne({
      caregiverId: req.auth.userId,
      status: 'checked_in',
    });
    if (!visit) {
      return res.status(400).json({ message: 'No active check-in found' });
    }

    const elder = await Elder.findById(visit.elderId);
    if (!elder) {
      return res.status(404).json({ message: 'Elder not found' });
    }

    const distance = distanceMeters(
      lat,
      lng,
      elder.latitude,
      elder.longitude
    );
    if (distance > MAX_DISTANCE_METERS) {
      return res.status(400).json({
        message: `Check-out rejected. You are ${Math.round(distance)} m away (max ${MAX_DISTANCE_METERS} m).`,
        distanceMeters: Math.round(distance),
      });
    }

    visit.status = 'checked_out';
    visit.checkOutAt = new Date();
    visit.checkOutLatitude = lat;
    visit.checkOutLongitude = lng;
    visit.checkOutDistanceMeters = Math.round(distance);
    visit.checkOutPhotoUrl = photoUrl;
    await visit.save();

    const populated = await Visit.findById(visit._id).populate(
      'elderId',
      'name address latitude longitude'
    );

    res.json({
      message: 'Checked out successfully',
      visit: visitDto(populated),
    });
  } catch (err) {
    next(err);
  }
}
