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
		const ruta = path + TERMINACION;
		const body = JSON.stringify( carga );

		fetch( ruta, {
			method: 'POST',
			body,
		});
	}

	Nando.Red = 
	{
		traeJson,
		enviaJson,
	};
})();
