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
					this.paths = paths;
					
					return this;
				});
		},

		trae( modulo, path, generator ) 
		{
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
			}.bind( this )).then(modulos =>
			{
				if (generator) generator.next( modulos );

				return modulos;
			});
		}
	}
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
