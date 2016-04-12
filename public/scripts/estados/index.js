/* global Nando */

( function() {

	Nando.Estados = {

		INICIO    : Symbol( 'inicio' ),
		LIBRO     : Symbol( 'libro' ),
		LEYENDO   : Symbol( 'leyendo' ),
		CATEGORIZA: Symbol( 'categoriza' ),

		anterior: null,
		actual  : this.INICIO,

		// TODO: Las categorias estan en el cuaderno con sus triggers
	}
})()
