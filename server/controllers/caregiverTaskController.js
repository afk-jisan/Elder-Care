import { Task, TASK_TYPES, TASK_STATUSES, COMPLETION_METHODS } from '../models/Task.js';
import { CarePlan } from '../models/CarePlan.js';
import { Visit } from '../models/Visit.js';

function taskDto(task) {
  return {
    id: task._id.toString(),
    carePlanId: task.carePlanId.toString(),
    elderId: task.elderId?._id
      ? task.elderId._id.toString()
      : task.elderId.toString(),
    elder: task.elderId?.name
      ? {
          id: task.elderId._id.toString(),
          name: task.elderId.name,
          address: task.elderId.address,
        }
      : undefined,
    caregiverId: task.caregiverId.toString(),
    familyMemberId: task.familyMemberId.toString(),
    type: task.type,
    title: task.title,
    scheduledTime: task.scheduledTime,
    completionMethod: task.completionMethod,
    status: task.status,
    checkInTime: task.checkInTime,
    checkOutTime: task.checkOutTime,
    photoUrl: task.photoUrl,
    completionNote: task.completionNote,
    completedAt: task.completedAt,
    visitId: task.visitId ? task.visitId.toString() : null,
    createdAt: task.createdAt,
  };
}

export async function listCaregiverTasks(req, res, next) {
  try {
    const filter = { caregiverId: req.auth.userId };
    if (req.query.status && TASK_STATUSES.includes(req.query.status)) {
      filter.status = req.query.status;
    }

    const tasks = await Task.find(filter)
      .populate('elderId', 'name address')
      .sort({ scheduledTime: 1 });

    res.json({ tasks: tasks.map(taskDto) });
  } catch (err) {
    next(err);
  }
}

export async function completeTask(req, res, next) {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      caregiverId: req.auth.userId,
    }).populate('elderId', 'name address');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    if (task.status === 'completed') {
      return res.status(400).json({ message: 'Task is already completed and locked' });
    }
    if (task.status === 'cancelled') {
      return res.status(400).json({ message: 'Cancelled tasks cannot be completed' });
    }

    const activeVisit = await Visit.findOne({
      caregiverId: req.auth.userId,
      elderId: task.elderId._id || task.elderId,
      status: 'checked_in',
    });
    if (!activeVisit) {
      return res.status(400).json({
        message: 'An active check-in for this elder is required before completing the task',
      });
    }

    const { photoUrl, completionNote } = req.body || {};
    if (task.completionMethod === 'photo' && !String(photoUrl || '').trim()) {
      return res.status(400).json({
        message: 'A photo URL is required to complete this task',
      });
    }
    if (task.completionMethod === 'note' && !String(completionNote || '').trim()) {
      return res.status(400).json({
        message: 'A completion note is required for this task',
      });
    }

    task.status = 'completed';
    task.completedAt = new Date();
    task.checkInTime = activeVisit.checkInAt;
    task.visitId = activeVisit._id;
    if (photoUrl !== undefined) {
      task.photoUrl = String(photoUrl).trim();
    }
    if (completionNote !== undefined) {
      task.completionNote = String(completionNote).trim();
    }
    await task.save();

    const populated = await Task.findById(task._id).populate(
      'elderId',
      'name address'
    );

    res.json({
      message: 'Task completed',
      task: taskDto(populated),
    });
  } catch (err) {
    next(err);
  }
}

export async function createFamilyTask(req, res, next) {
  try {
    const { carePlanId, type, title, scheduledTime, completionMethod } = req.body;

    if (!carePlanId || !type || !title || !scheduledTime) {
      return res.status(400).json({
        message: 'carePlanId, type, title, and scheduledTime are required',
      });
    }
    if (!TASK_TYPES.includes(type)) {
      return res.status(400).json({ message: 'Invalid task type' });
    }

    const method = completionMethod || 'note';
    if (!COMPLETION_METHODS.includes(method)) {
      return res.status(400).json({ message: 'Invalid completion method' });
    }

    const when = new Date(scheduledTime);
    if (Number.isNaN(when.getTime())) {
      return res.status(400).json({ message: 'Invalid scheduledTime' });
    }

    const plan = await CarePlan.findOne({
      _id: carePlanId,
      familyMemberId: req.auth.userId,
      status: 'active',
    });
    if (!plan) {
      return res.status(404).json({
        message: 'Active care plan not found',
      });
    }
    if (!plan.caregiverId) {
      return res.status(400).json({
        message: 'Care plan has no assigned caregiver',
      });
    }

    const task = await Task.create({
      carePlanId: plan._id,
      elderId: plan.elderId,
      caregiverId: plan.caregiverId,
      familyMemberId: plan.familyMemberId,
      type,
      title: String(title).trim(),
      scheduledTime: when,
      completionMethod: method,
      status: 'scheduled',
    });

    const populated = await Task.findById(task._id).populate(
      'elderId',
      'name address'
    );

    res.status(201).json({
      message: 'Task created',
      task: taskDto(populated),
    });
  } catch (err) {
    next(err);
  }
}

export async function listFamilyTasks(req, res, next) {
  try {
    const filter = { familyMemberId: req.auth.userId };
    if (req.query.carePlanId) {
      filter.carePlanId = req.query.carePlanId;
    }
    if (req.query.status && TASK_STATUSES.includes(req.query.status)) {
      filter.status = req.query.status;
    }

    const tasks = await Task.find(filter)
      .populate('elderId', 'name address')
      .sort({ scheduledTime: 1 });

    res.json({ tasks: tasks.map(taskDto) });
  } catch (err) {
    next(err);
  }
}
