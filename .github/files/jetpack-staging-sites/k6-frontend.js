/* eslint-disable eqeqeq */
import { check, sleep } from 'k6';
import http from 'k6/http';
import { sites } from './k6-shared.js';

export const options = {
	vus: 3,
	iterations: 3,
	thresholds: {
		checks: [
			{
				/**
				 * Fail if the number of failed checks is greater than 0.
				 * see: https://k6.io/docs/using-k6/thresholds/#fail-a-load-test-using-checks
				 */
				threshold: 'rate == 1.0',
			},
		],
	},
};

/**
 * Default test function.
 */
export default function () {
	sites.forEach( site => {
		// Homepage.
		let res = http.get( site.url );
		check( res, {
			'status was 200': r => r.status == 200,
		} );

		// A random post.
		res = http.get( `${ site.url }/?random` );
		check( res, {
			'status was 200': r => r.status == 200,
		} );

		// Jetpack Blocks test post.
		if ( site.url !== 'https://jetpackedgeprivate.wpcomstaging.com' ) {
			res = http.get( `${ site.url }/2023/06/09/jetpack-blocks/` );
			check( res, {
				'status was 200': r => r.status == 200,
				'verify post end contents': r => r.body.includes( 'End of Jetpack Blocks post content' ),
			} );
		}
	} );

	sleep( 1 );
}
