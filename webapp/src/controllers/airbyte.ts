'use strict';

import { getDatasourceById } from '../db/datasource';
import { dynamicResponse } from '../util';
import toObjectId from '../lib/misc/toobjectid';

export async function getSpecification(req, res, _next) {
	const base64Credentials = Buffer.from(`${process.env.AIRBYTE_USERNAME}:${process.env.AIRBYTE_PASSWORD}`).toString('base64');
	let schema;
	try {
		const res = await fetch(`${process.env.AIRBYTE_HOST}/api/v1/source_definition_specifications/get`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Basic ${base64Credentials}`,
			},
			body: JSON.stringify({
				workspaceId: 'c2fa341f-017e-4176-b77a-0257e0e87749', //TODO: take from team workspaceId (created in team creation)
				sourceDefinitionId: req.query.sourceDefinitionId,
			})
		});
		schema = await res.json();
	} catch (e) {
		console.error(e); //TODO: how to handle this
		schema = null;
	}
	return {
		csrf: req.csrfToken(),
		schema,
	};
}

/**
 * GET /airbyte/schema
 * team agents json data
 */
export async function specificationJson(req, res, next) {
	if (!req?.query?.sourceDefinitionId || typeof req.query.sourceDefinitionId !== 'string') {
		return dynamicResponse(req, res, 400, { error: 'Invalid inputs' });
	}
	const data = await getSpecification(req, res, next);
	return res.json({ ...data, account: res.locals.account });
}
