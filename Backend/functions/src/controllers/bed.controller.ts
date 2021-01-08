
import '../http';
import { Bed } from '../models/bed.model';
import { getRepository } from 'fireorm';
import { validationResult } from 'express-validator/check';
const admin = require('firebase-admin');
const bedRepository = getRepository(Bed);

module.exports = {
    /**
    * `GETS` all beds of the collection.
    *
    * @returns The list of beds retrieved
    */
    getAllBeds: async (req, res, next) => {
        try {
            // Checks if there's errors on the body
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                console.log(errors.mapped());
                return res.status(400).json({ success: false, errors: errors.mapped(), msg: "Error en alguno de los datos recibidos" });
            }

            const beds = [];
            const bedsSnapshot = await bedRepository.find();
            bedsSnapshot.forEach((doc) => {
                beds.push({
                    id: doc.id,
                    data: doc
                });
            });

            res.status(200).json({ success: true, camas: beds, msg: "Camas obtenidas con éxito" });
        } catch (e) {
            res.status(500).json({ success: false, errors: e.message, msg: "Se ha producido un error interno en el servidor." });
        }
    },
    /**
    * `CREATES` a bed.
    *
    * @body Json with required fields to create a bed
    * 
    * @returns The created bed
    */
    createBed: async (req, res, next) => {
        try {
            // Checks if there's errors on the body
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                console.log(errors.mapped());
                return res.status(400).json({ success: false, errors: errors.mapped(), msg: "Error en alguno de los datos recibidos" });
            }

            const bed = new Bed();
            bed.status = req.body.status;
            bed.updatedAt = admin.firestore.FieldValue.serverTimestamp();
            bed.createdAt = admin.firestore.FieldValue.serverTimestamp();
            const bedCreated = await bedRepository.create(bed);

            res.status(200).json({ success: true, cama: bedCreated, msg: "Cama creada con éxito" });
        } catch (e) {
            res.status(500).json({ success: false, errors: e.message, msg: "Se ha producido un error interno en el servidor." });
        }
    },
    /**
    * `UPDATES` a bed by ID.
    *
    * @body Json with fields to update a bed
    * @param id - Id of the bed that will be updated
    * 
    * @returns The updated bed
    */
    updateBedById: async (req, res, next) => {
        try {
            // Checks if there's errors on the body
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                console.log(errors.mapped());
                return res.status(400).json({ success: false, errors: errors.mapped(), msg: "Error en alguno de los datos recibidos" });
            }

            const id = req.params.id;

            const bed = await bedRepository.findById(id);

            if (bed === null) {
                return res.status(404).json({ success: false, msg: "No se encontró una cama con ese ID" });
            }

            bed.status = req.body.status;
            bed.updatedAt = admin.firestore.FieldValue.serverTimestamp();

            const bedUpdated = await bedRepository.update(bed);

            res.status(200).json({ success: true, cama: bedUpdated, msg: "Cama actualizada con éxito" });
        } catch (e) {
            res.status(500).json({ success: false, errors: e.message, msg: "Se ha producido un error interno en el servidor." });
        }
    },
    /**
    * `DELETES` a bed by ID.
    *
    * @param id - Id of the bed that will be deleted
    * 
    * @returns The success message
    */
    deleteBedById: async (req, res, next) => {
        try {
            // Checks if there's errors on the body
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                console.log(errors.mapped());
                return res.status(400).json({ success: false, errors: errors.mapped(), msg: "Error en alguno de los datos recibidos" });
            }

            const id = req.params.id;
            const bed = await bedRepository.findById(id);

            if (bed === null) {
                return res.status(404).json({ success: false, msg: "No se encontró una cama con ese ID" });
            }

            await bedRepository.delete(id);
            return res.status(200).json({ success: true, msg: "Cama eliminada con éxito" });
        } catch (e) {
            res.status(500).json({ success: false, errors: e.message, msg: "Se ha producido un error interno en el servidor." });
        }
    },
}