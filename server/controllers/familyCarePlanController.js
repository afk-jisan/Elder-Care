import { Elder } from '../models/Elder.js';
import { CarePlan, CARE_PACKAGES } from '../models/CarePlan.js';
import { User } from '../models/User.js';
import { geocodeAddress } from '../utils/geocode.js';

function elderDto(elder) {
  return {
    id: elder._id.toString(),
    name: elder.name,
    address: elder.address,
    dateOfBirth: elder.dateOfBirth,
    latitude: elder.latitude,
    longitude: elder.longitude,
    familyMemberId: elder.familyMemberId.toString(),
    createdAt: elder.createdAt,
  };
}

function planDto(plan) {
  return {
    id: plan._id.toString(),
    familyMemberId: plan.familyMemberId.toString(),
    elderId: plan.elderId?._id
      ? plan.elderId._id.toString()
      : plan.elderId.toString(),
    elder: plan.elderId?.name
      ? {
          id: plan.elderId._id.toString(),
          name: plan.elderId.name,
          address: plan.elderId.address,
        }
      : undefined,
    package: plan.package,
    caregiverId: plan.caregiverId
      ? plan.caregiverId._id
        ? plan.caregiverId._id.toString()
        : plan.caregiverId.toString()
      : null,
    caregiver: plan.caregiverId?.name
      ? {
          id: plan.caregiverId._id.toString(),
          name: plan.caregiverId.name,
          email: plan.caregiverId.email,
        }
      : undefined,
    status: plan.status,
    startDate: plan.startDate,
    createdAt: plan.createdAt,
  };
}

export async function listElders(req, res, next) {
  try {
    const elders = await Elder.find({ familyMemberId: req.auth.userId }).sort({
      createdAt: -1,
    });
    res.json({ elders: elders.map(elderDto) });
  } catch (err) {
    next(err);
  }
}

export async function createElder(req, res, next) {
  try {
    const { name, address, dateOfBirth, latitude, longitude } = req.body;

    if (!name || !address) {
      return res.status(400).json({
        message: 'Name and address are required',
      });
    }

    let lat =
      latitude === undefined || latitude === '' ? NaN : Number(latitude);
    let lng =
      longitude === undefined || longitude === '' ? NaN : Number(longitude);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      try {
        const geo = await geocodeAddress(address);
        lat = geo.latitude;
        lng = geo.longitude;
      } catch (geoErr) {
        return res.status(geoErr.status || 400).json({
          message:
            geoErr.message ||
            'Could not find coordinates for that address. Try a clearer address.',
        });
      }
    }

    const elder = await Elder.create({
      familyMemberId: req.auth.userId,
      name,
      address,
      dateOfBirth: dateOfBirth || undefined,
      latitude: lat,
      longitude: lng,
    });

    res.status(201).json({ message: 'Elder created', elder: elderDto(elder) });
  } catch (err) {
    next(err);
  }
}

export async function listCaregivers(req, res, next) {
  try {
    const caregivers = await User.find({
      role: 'caregiver',
      isActive: true,
    }).sort({ name: 1 });

    res.json({
      caregivers: caregivers.map((c) => ({
        id: c._id.toString(),
        name: c.name,
        email: c.email,
        phone: c.phone,
      })),
    });
  } catch (err) {
    next(err);
  }
}

export async function listCarePlans(req, res, next) {
  try {
    const plans = await CarePlan.find({ familyMemberId: req.auth.userId })
      .populate('elderId', 'name address')
      .populate('caregiverId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ carePlans: plans.map(planDto) });
  } catch (err) {
    next(err);
  }
}

export async function createCarePlan(req, res, next) {
  try {
    const { elderId, package: pkg, caregiverId } = req.body;

    if (!elderId || !pkg) {
      return res
        .status(400)
        .json({ message: 'Elder and service package are required' });
    }

    if (!CARE_PACKAGES.includes(pkg)) {
      return res.status(400).json({ message: 'Invalid service package' });
    }

    const elder = await Elder.findOne({
      _id: elderId,
      familyMemberId: req.auth.userId,
    });
    if (!elder) {
      return res.status(404).json({ message: 'Elder not found' });
    }

    let status = 'draft';
    let caregiver = null;

    if (caregiverId) {
      caregiver = await User.findOne({
        _id: caregiverId,
        role: 'caregiver',
        isActive: true,
      });
      if (!caregiver) {
        return res.status(400).json({ message: 'Caregiver not available' });
      }
      status = 'pending_acceptance';
    }

    const plan = await CarePlan.create({
      familyMemberId: req.auth.userId,
      elderId: elder._id,
      package: pkg,
      caregiverId: caregiver ? caregiver._id : null,
      status,
    });

    const populated = await CarePlan.findById(plan._id)
      .populate('elderId', 'name address')
      .populate('caregiverId', 'name email');

    res.status(201).json({
      message: 'Care plan created',
      carePlan: planDto(populated),
    });
  } catch (err) {
    next(err);
  }
}

export async function assignCaregiver(req, res, next) {
  try {
    const { caregiverId } = req.body;
    if (!caregiverId) {
      return res.status(400).json({ message: 'Caregiver is required' });
    }

    const plan = await CarePlan.findOne({
      _id: req.params.id,
      familyMemberId: req.auth.userId,
    });
    if (!plan) {
      return res.status(404).json({ message: 'Care plan not found' });
    }

    const caregiver = await User.findOne({
      _id: caregiverId,
      role: 'caregiver',
      isActive: true,
    });
    if (!caregiver) {
      return res.status(400).json({ message: 'Caregiver not available' });
    }

    plan.caregiverId = caregiver._id;
    plan.status = 'pending_acceptance';
    await plan.save();

    const populated = await CarePlan.findById(plan._id)
      .populate('elderId', 'name address')
      .populate('caregiverId', 'name email');

    res.json({
      message: 'Caregiver assigned; waiting for acceptance',
      carePlan: planDto(populated),
    });
  } catch (err) {
    next(err);
  }
}

export async function respondToCarePlan(req, res, next) {
  try {
    const { decision } = req.body;
    if (!['accept', 'reject'].includes(decision)) {
      return res
        .status(400)
        .json({ message: 'Decision must be accept or reject' });
    }

    const plan = await CarePlan.findOne({
      _id: req.params.id,
      caregiverId: req.auth.userId,
      status: 'pending_acceptance',
    });
    if (!plan) {
      return res.status(404).json({ message: 'Pending care plan not found' });
    }

    plan.status = decision === 'accept' ? 'active' : 'rejected';
    await plan.save();

    const populated = await CarePlan.findById(plan._id)
      .populate('elderId', 'name address')
      .populate('caregiverId', 'name email');

    res.json({
      message:
        decision === 'accept' ? 'Care plan accepted' : 'Care plan rejected',
      carePlan: planDto(populated),
    });
  } catch (err) {
    next(err);
  }
}

export async function listPendingAssignments(req, res, next) {
  try {
    const plans = await CarePlan.find({
      caregiverId: req.auth.userId,
      status: 'pending_acceptance',
    })
      .populate('elderId', 'name address')
      .populate('familyMemberId', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      carePlans: plans.map((plan) => ({
        ...planDto(plan),
        family: plan.familyMemberId?.name
          ? {
              id: plan.familyMemberId._id.toString(),
              name: plan.familyMemberId.name,
              email: plan.familyMemberId.email,
            }
          : undefined,
      })),
    });
  } catch (err) {
    next(err);
  }
}
