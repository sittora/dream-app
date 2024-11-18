import { Router } from 'express';
import { db } from '../../db/index.js';
import { dreams, dreamSymbols, interpretations } from '../../db/schema.js';
import { eq, and, desc, asc, sql } from 'drizzle-orm';
import { createId } from '../../utils/ids.js';

const router = Router();

// Get all dreams for the current user
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, visibility, sortBy = 'createdAt', order = 'desc' } = req.query;
    const offset = (page - 1) * limit;

    // Validate query parameters
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({ 
        status: 'error',
        code: 'INVALID_PAGE',
        message: 'Invalid page number' 
      });
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({ 
        status: 'error',
        code: 'INVALID_LIMIT',
        message: 'Invalid limit. Must be between 1 and 100' 
      });
    }

    // Build query
    let query = db.select()
      .from(dreams)
      .where(eq(dreams.userId, req.user.id))
      .limit(limitNum)
      .offset(offset);

    // Add visibility filter
    if (visibility) {
      query = query.where(eq(dreams.visibility, visibility));
    }

    // Add sorting
    const validSortFields = ['createdAt', 'title', 'date'];
    const validOrders = ['asc', 'desc'];
    
    if (!validSortFields.includes(sortBy)) {
      return res.status(400).json({ 
        status: 'error',
        code: 'INVALID_SORT',
        message: 'Invalid sort field' 
      });
    }

    if (!validOrders.includes(order.toLowerCase())) {
      return res.status(400).json({ 
        status: 'error',
        code: 'INVALID_ORDER',
        message: 'Invalid sort order' 
      });
    }

    query = order.toLowerCase() === 'desc' 
      ? query.orderBy(desc(dreams[sortBy]))
      : query.orderBy(asc(dreams[sortBy]));

    // Execute query and get total count
    const [dreamsResult, countResult] = await Promise.all([
      query,
      db.select({ count: sql`count(*)` })
        .from(dreams)
        .where(eq(dreams.userId, req.user.id))
    ]);

    const total = parseInt(countResult[0].count);
    const totalPages = Math.ceil(total / limitNum);

    // Return response
    res.json({
      status: 'success',
      data: {
        dreams: dreamsResult,
        pagination: {
          total,
          page: pageNum,
          totalPages,
          hasMore: pageNum < totalPages
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get a specific dream
router.get('/:id', async (req, res, next) => {
  try {
    const dream = await db.select()
      .from(dreams)
      .where(
        and(
          eq(dreams.id, req.params.id),
          eq(dreams.userId, req.user.id)
        )
      )
      .limit(1);

    if (!dream.length) {
      return res.status(404).json({ 
        status: 'error',
        code: 'DREAM_NOT_FOUND',
        message: 'Dream not found' 
      });
    }

    res.json({
      status: 'success',
      data: dream[0]
    });
  } catch (error) {
    next(error);
  }
});

// Create a new dream
router.post('/', async (req, res, next) => {
  try {
    const dreamData = {
      id: createId(),
      userId: req.user.id,
      ...req.body,
      metadataJson: JSON.stringify(req.body.metadata || {}),
    };

    const [dream] = await db.insert(dreams)
      .values(dreamData)
      .returning();

    res.status(201).json({
      status: 'success',
      data: dream
    });
  } catch (error) {
    next(error);
  }
});

// Update a dream
router.put('/:id', async (req, res, next) => {
  try {
    const dream = await db.select()
      .from(dreams)
      .where(
        and(
          eq(dreams.id, req.params.id),
          eq(dreams.userId, req.user.id)
        )
      )
      .limit(1);

    if (!dream.length) {
      return res.status(404).json({ 
        status: 'error',
        code: 'DREAM_NOT_FOUND',
        message: 'Dream not found' 
      });
    }

    const [updatedDream] = await db.update(dreams)
      .set({
        ...req.body,
        metadataJson: JSON.stringify(req.body.metadata || {}),
        updatedAt: new Date(),
      })
      .where(eq(dreams.id, req.params.id))
      .returning();

    res.json({
      status: 'success',
      data: updatedDream
    });
  } catch (error) {
    next(error);
  }
});

// Delete a dream
router.delete('/:id', async (req, res, next) => {
  try {
    const dream = await db.select()
      .from(dreams)
      .where(
        and(
          eq(dreams.id, req.params.id),
          eq(dreams.userId, req.user.id)
        )
      )
      .limit(1);

    if (!dream.length) {
      return res.status(404).json({ 
        status: 'error',
        code: 'DREAM_NOT_FOUND',
        message: 'Dream not found' 
      });
    }

    await db.delete(dreams)
      .where(eq(dreams.id, req.params.id));

    res.json({
      status: 'success',
      message: 'Dream deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Get dream symbols
router.get('/:id/symbols', async (req, res, next) => {
  try {
    const symbols = await db.select()
      .from(dreamSymbols)
      .where(eq(dreamSymbols.dreamId, req.params.id))
      .orderBy(desc(dreamSymbols.frequency));

    res.json({
      status: 'success',
      data: symbols
    });
  } catch (error) {
    next(error);
  }
});

// Add dream symbol
router.post('/:id/symbols', async (req, res, next) => {
  try {
    const [symbol] = await db.insert(dreamSymbols)
      .values({
        id: createId(),
        dreamId: req.params.id,
        ...req.body,
      })
      .returning();

    res.status(201).json({
      status: 'success',
      data: symbol
    });
  } catch (error) {
    next(error);
  }
});

// Get dream interpretations
router.get('/:id/interpretations', async (req, res, next) => {
  try {
    const dreamInterpretations = await db.select()
      .from(interpretations)
      .where(eq(interpretations.dreamId, req.params.id))
      .orderBy(desc(interpretations.createdAt));

    res.json({
      status: 'success',
      data: dreamInterpretations
    });
  } catch (error) {
    next(error);
  }
});

// Add dream interpretation
router.post('/:id/interpretations', async (req, res, next) => {
  try {
    const [interpretation] = await db.insert(interpretations)
      .values({
        id: createId(),
        dreamId: req.params.id,
        userId: req.user.id,
        ...req.body,
      })
      .returning();

    res.status(201).json({
      status: 'success',
      data: interpretation
    });
  } catch (error) {
    next(error);
  }
});

export const dreamsRouter = router;
