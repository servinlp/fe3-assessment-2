// Resources: https://github.com/d3/d3-sankey
// Used as example: https://bl.ocks.org/mbostock/ca9a0bb7ba204d12974bca90acc507c0

const svg = d3.select( 'svg' ),
	tooltip = d3.select( '.tooltip' ),
	width = window.innerWidth - 30,
	height = window.innerHeight - 150,
	nav = document.querySelector( 'nav' ),

	// van example
	formatNumber = d3.format( ',.0f' ),
	format = d => `${formatNumber( d )} deaths`,
	color = d3.scaleOrdinal( d3.schemeCategory10 ),

	sankey = d3.sankey()
		.nodeWidth( 15 )
		.nodePadding( 10 )
		.extent( [ [ 1, 1 ], [ width - 1, height - 6 ] ] )
	// Eind example


svg.attr( 'width', width )
svg.attr( 'height', height )

	let link = svg.append( 'g' )
	    .attr( 'class', 'links' )
	    .attr( 'fill', 'none' )
	    .attr( 'stroke', '#000' )
	    .attr( 'stroke-opacity', 0.2 )
		.selectAll( 'path' ),

	node = svg.append( 'g' )
	    .attr( 'class', 'nodes' )
	    .attr( 'font-family', 'sans-serif' )
	    .attr( 'font-size', 10 )
		.selectAll( 'g' ),

	mousePos = [ 0, 0 ]

d3.text( 'deaths.csv', load )

function load( d ) {

	const headerEnd = d.split( '\n', 2 ).join( '\n' ).length,
		remains = d.replace( d.substring( 0, d.indexOf( '1 Infectious and parasitic diseases' ) -1 ), '' ),
		withoutEnd = remains.replace( remains.substring( remains.indexOf( 'Average population' ) -1 ), '' ),
		csv = d3.csvParseRows( withoutEnd ),
		data = {},
		sankeyData = {
			nodes: [],
			links: []
		}

	csv.forEach( el => {

		// Als het jaar nog niet in het object staat. Plaats dit er in
		if ( !data[ el[ 3 ] ] ) data[ el[ 3 ] ] = {}

		// Vul het jaar met de gegevens die hier bij horen
		data[ el[ 3 ] ][ el[ 1 ] ] = el[ 5 ]

	})

	let yearNum = 0

	for ( const year in data ) {

		sankeyData.nodes.push( { name: year } )

		yearNum++

	}

	// Zet de name voor de Sankey (op deze manier gebeurt dit maar 1 keer)
	for ( const item in data[ Object.keys( data )[ 0 ] ] ) {

		sankeyData.nodes.push( { name: item } )

	}

	// Zet de links voor de Sankey
	for ( const item in data ) {

		//  mainIndex is het begin van de lijn
		// Object.keys(...) geeft je de object key names
		// Aan de hand van indexOf kan je dan de index van de key krijgen (zoals bij een array)
		// Dit is nodig om de lijnen te maken. Hier moet je de index van de targets weten
		const mainIndex = Object.keys( data ).indexOf( item )

		for ( const el in data[ item ] ) {

			// childIndex is waar de lijn naartoe gaat
			const childIndex = Object.keys( data[ item ] ).indexOf( el )

			sankeyData.links.push( { source: mainIndex, target: ( yearNum - 1 ) + ( childIndex + 1 ), value: parseInt( data[ item ][ el ] ) } )

		}

	}

	sankey( sankeyData )

	link = link.data( sankeyData.links )
    	.enter()
		.append( 'path' )
		.attr( 'd', d3.sankeyLinkHorizontal() )
		.attr( 'stroke-width', d => Math.max( 1, d.width ) ) // minimale grote wordt dan 1px


	link.append( 'title' )
		.text( d => `${d.source.name} → ${d.target.name}\n${format( d.value )}` ) // van example

	link.on( 'mouseover', function() {

		// This is geen d3 object. Daarom wordt de select er over heen gegooid
		tooltip.text( d3.select( this ).select( 'title' ).text() )

	})
	.on( 'mousemove', function() {

		mousePos = d3.mouse( this ) // Krijg de x en y positie van de mous

		tooltip.transition()
			.duration( 50 )
			.style( 'left', `${mousePos[ 0 ]}px` )
			.style( 'top', `${mousePos[ 1 ]}px` )

	})

	node = node.data( sankeyData.nodes )
		.enter()
		.append( 'g' )

	node.append( 'rect' )
		.attr( 'x', d => d.x0 )
		.attr( 'y', d => d.y0 )
		.attr( 'height', d => d.y1 - d.y0 )
		.attr( 'width', d => d.x1 - d.x0 )
		.attr( 'fill', d => color( d.name.replace( / .*/, '' ) ) )
		.attr( 'stroke', '#000' )

	node.append( 'text' )
		.attr( 'x', d => d.x0 - 6 )
		.attr( 'y', d => ( d.y1 + d.y0 ) / 2 )
		.attr( 'dy', '0.35em' )
		.attr( 'text-anchor', 'end' )
		.text( d => d.name )
		.filter( d => d.x0 < width / 2 )
		.attr( 'x', d => d.x1 + 6 )
		.attr( 'text-anchor', 'start' )

	node.append( 'title' )
		.text( d => d.name + '\n' + format( d.value ) )

}
