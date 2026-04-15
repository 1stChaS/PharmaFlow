import { asyncHandler } from '../utils/async-handler.js';
import { sendSuccess } from '../utils/response.js';
import { inventoryService } from '../services/inventory.service.js';

export const inventoryController = {
  getStockStatus: asyncHandler(async (_req, res) => {
    const data = await inventoryService.getStockStatus();
    return sendSuccess(res, data, 'Inventory stock status fetched');
  }),
};