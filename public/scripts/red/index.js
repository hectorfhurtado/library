/* global Nando, fetch */

( function() 
{
	const TERMINACION = '.fetch';
	
	/**
	 * Trae informacion del servidor
	 * @param   {string}          path    El path donde esta la informacion
	 * @param   {string}          datos   Si se neceita traer algun dato adicional en la ruta
	 * @param	{generator}		  generator
	 * @returns {promise<object>} La informacion si la hay
	 */
	function traeJson( path, datos, generator ) 
	{
		Nando.assertTypesOf( 'string', path );
		datos     && Nando.assertTypesOf( 'string', datos );
		generator && Nando.assertGenerator( generator );

		const ruta = path + TERMINACION + ( datos ? `?${ datos }` : '' );

		return fetch( ruta )
			.then( informacion => informacion.json() )
			.then( informacion =>
			{
				if (generator) generator.next(informacion);

				return informacion;
			})
			.catch( error => console.error( error ));
	}
	
	/**
	 * Envia un mensaje POST al servidor
	 * @author Nando
	 * @param {string} path  El endpoint al que le queremos enviar el dato
	 * @param {object} carga La informacion a enviar
	 */
	function enviaJson( path, carga ) 
	{
		Nando.assertTypesOf( 'string', path );

		const ruta = path + TERMINACION;
		const body = JSON.stringify( carga );

		fetch( ruta, {
			method: 'POST',
			body,
		});
	}

	/**
	 * Envia al servidor el libro que selecciona el usuario
	 * @param	{string}	nombre
	 * @param	{object}	libro
	 * @param	{generator}	generator
	 */
	function subeLibro( nombre, libro, generator ) 
	{
		Nando.assertTypesOf( 'string', nombre );
		console.assert( /\.pdf$/.test( nombre ), nombre );
		Nando.assertTypesOf( 'object', libro );
		generator && Nando.assertGenerator( generator );

		const headers = new Headers(
		{
			'Content-type': 'text/plain; charset=x-user-defined-binary',
		});

		const opciones =
		{
			headers,
			method : 'POST',
			body   : libro, 
		};

		let libroCodificado = encodeURIComponent( nombre.replace( /[\- ]/g, '_' ));
		
		fetch( `subelibro.fetch?${ libroCodificado }`, opciones )
			.then(() =>
			{
				if (generator) generator.next();
			})
			.catch(error => console.error(error));
	}

	Nando.Red = 
	{
		traeJson,
		enviaJson,
		subeLibro,
	};
})();
