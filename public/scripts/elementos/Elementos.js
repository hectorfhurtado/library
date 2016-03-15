/* global Nando */

( function()
{
    Nando.Elementos =
    {
        elementos: {},

        /**
         * Tomamos un selector y almacenamos el elemento del DOM para tener un cache y no perder tiempo
         * haciendo query al DOM
         * @param   {string}              selector Un selector de CSS
         * @returns {Promise<DOMElement>}
         */
        dame( selector )
        {
            return new Promise( function( res )
            {
                if ( !this.elementos[ selector ])
                {
                    this.elementos[ selector ] = document.querySelector( selector )
                }
                res( this.elementos[ selector ])
            }.bind( this ))
        },

        /**
         * Buscamos el elemento por el ID y lo guardamos en cache para futura referencia
         * @param   {string}   id
         * @returns {promise<DOMElement>}
         */
        damePorId( id )
        {
            return new Promise( function( res )
            {
                if ( !this.elementos[ id ])
                {
                    this.elementos[ id ] = document.getElementById( id )
                }
                res( this.elementos[ id ])
            }.bind( this ))
        }
    }
})()
