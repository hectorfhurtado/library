var Nando =
{
	Cargador: 
	{
		paths: null,

		$HEAD  : document.querySelector( 'head' ),
		SCRIPTS: 'scripts/',
		
		traePaths() 
		{
			return fetch( 'paths.json' )
				.then( paths => paths.json() )
				.then( paths => 
				{
					Nando.assertTypesOf( 'object', paths );

					this.paths = paths;
					return this;
				});
		},

		trae( modulo, path, generator ) 
		{
			Nando.assertTypesOf( 'string', modulo );
			path      && Nando.assertTypesOf( 'string', path );
			generator && Nando.assertGenerator( generator );

			return new Promise( function( res ) 
			{
				if ( Nando[ modulo ]) 
				{
					res( Nando[ modulo ]);
					return;
				}

				if ( Nando[ path ]) 
				{
					Nando[ modulo ] = Nando[ path ];

					res( Nando[ modulo ]);
					return;
				}

				let realPath = path ?
					Nando.Cargador.SCRIPTS + path + '.js' :
					Nando.Cargador.SCRIPTS + this.paths[ modulo ] + '.js';

				let script  = document.createElement( 'script' );
				script.type = 'text/javascript';
				script.src  = realPath;

				Nando.Cargador.$HEAD.appendChild( script );

				script.addEventListener( 'load', alCargar.bind( this ));

				function alCargar() 
				{
					script.removeEventListener( 'load', alCargar );
					Nando.Cargador.$HEAD.removeChild( script );

					script = null;

					if ( path ) Nando[ path ] = Nando[ modulo ];

					res( Nando[ modulo ]);
				}
			}.bind( this )).then(_modulo =>
			{
				Nando.assertTypesOf([ 'object', 'function' ], _modulo );

				if (generator) generator.next( _modulo );
				return _modulo;
			});
		}
	},

	assertGenerator( generator )
	{
		console.assert( !!generator );
		console.assert( 'next' in generator && 'throw' in generator, generator );
	},

	assertPromesa( promesa )
	{
		console.assert( !!promesa );
		console.assert( 'then' in promesa, promesa );
	},

	assertTypesOf( types, objeto )
	{
		console.assert(( Array.isArray( types ) && types.length > 0 ) || typeof types == 'string', types );
		console.assert( !!objeto );

		if (Array.isArray( types ))
			console.assert( types.some( type => typeof objeto == type ), objeto );
		else
			console.assert( typeof objeto == types, objeto );
	},
};

window.addEventListener( 'DOMContentLoaded', function() 
{
	Nando.Cargador
		.traePaths()
		.then( Cargador => Cargador.trae( 'Arquitecto' ))
		.then( A => A.inicia() )
		/* eslint no-console: "off" */
		.catch( error => console.log( error ));
});

if ('paintWorklet' in window)
	window.paintWorklet.import('paintworklet.js');