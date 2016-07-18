registerPaint('ripple', class
{
    static get inputProperties()
    {
        return [ 'background-color', '--ripple-color', '--animation-tick', '--ripple-x', '--ripple-y', 'color' ];
    }

    paint( ctx, geom, properties )
    {
        const bgColor     = properties.get( 'background-color' ).cssText;
        const rippleColor = properties.get( '--ripple-color' ).cssText;
        const x           = parseFloat(properties.get( '--ripple-x' ).cssText);
        const y           = parseFloat(properties.get( '--ripple-y' ).cssText);

        let tick = parseFloat(properties.get( '--animation-tick' ).cssText);

        if (tick < 0) tick = 0;

        if (tick > 1000)
        {
            tick = 0;
            x    = Math.random() * 300;
            y    = Math.random() * 300;
        }

        ctx.fillStyle = bgColor;
        ctx.fillRect( 0, 0, geom.width, geom.height );

        ctx.fillStyle   = rippleColor;
        ctx.globalAlpha = 1 - tick / 1000;


        ctx.arc(
            x, y, // center
            geom.width * tick / 1000, // radius
            0, // startAngle
            2 * Math.PI //endAngle
        );

        ctx.fill();
    }
});