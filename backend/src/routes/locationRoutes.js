import {
  findLocations,
  findLocation,
  createLocation,
  updateLocation,
  deleteLocation
} from '../controllers/locationController.js';
import { verifyUser } from '../controllers/authController.js';
import { Roles } from '../shared/enums.js';

export const locationRoutes = app => {
  const auth = verifyUser([Roles.ADMIN, Roles.EXPLORER, Roles.MANAGER, Roles.SPONSOR]);
  const adminOnly = verifyUser([Roles.ADMIN]);

  /**
   * @openapi
   * tags:
   *  name: Locations
   *  description: Managing Locations endpoint
   */

  /**
   * @openapi
   * /v1/locations:
   *   get:
   *     description: Returns a list of all the locations
   *     tags: [Locations]
   *     responses:
   *       200:
   *         description: List of locations
   *         content:
   *           application/json:
   *            schema:
   *              type: array
   *              items:
   *                $ref: '#/components/schemas/location'
   *   post:
   *      description: Create a new location
   *      tags: [Locations]
   *      requestBody:
   *        required: true
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/location'
   *      responses:
   *        201:
   *          description: The location was successfully created
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/location'
   */
  app
    .route('/v1/locations')
    .get(auth, findLocations)
    .post(adminOnly, createLocation);

  /**
   * @openapi
   * /v1/locations/{locationId}:
   *   get:
   *     description: Get a location by id
   *     tags: [Locations]
   *     parameters:
   *        - name: locationId
   *          type: string
   *          in: path
   *          required: true
   *          description: The location id
   *     responses:
   *       200:
   *         description: The location description by id
   *         content:
   *           application/json:
   *            schema:
   *              $ref: '#/components/schemas/location'
   *       404:
   *         description: The location was not found
   *   patch:
   *     description: Update the location by the id
   *     tags: [Locations]
   *     parameters:
   *       - name: locationId
   *         type: string
   *         in: path
   *         required: true
   *         description: The location id
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/location'
   *     responses:
   *       200:
   *         description: The updated location description by id
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/location'
   *       404:
   *         description: The location was not found
   *       500:
   *         description: An error happened
   *   delete:
   *     description: Remove the location by the id
   *     tags: [Locations]
   *     parameters:
   *       - name: locationId
   *         type: string
   *         in: path
   *         required: true
   *         description: The location id
   *     responses:
   *       200:
   *         description: The location was deleted
   *       404:
   *         description: The location was not found
   */
  app
    .route('/v1/locations/:locationId')
    .get(auth, findLocation)
    .patch(adminOnly, updateLocation)
    .delete(adminOnly, deleteLocation);
};
