
const svg = d3.select( 'svg' ),
	width = parseInt( svg.attr( 'width' ) ),
	height = parseInt( svg.attr( 'height' ) ),
	nav = document.querySelector( 'nav' ),

	formatNumber = d3.format( ',.0f' ),
	format = d => `${formatNumber( d )} deaths`,
	color = d3.scaleOrdinal( d3.schemeCategory10 ),

	sankey = d3.sankey()
		.nodeWidth( 15 )
		.nodePadding( 10 )
		.extent( [ [ 1, 1 ], [ width - 1, height - 6 ] ] )

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
		.selectAll( 'g' )

d3.text( 'deaths.csv', load )

function load( d ) {

	const headerEnd = d.split( '\n', 2 ).join( '\n' ).length,
		// remains = d.slice( headerEnd ).trim()
		remains = d.replace( d.substring( 0, d.indexOf( '1 Infectious and parasitic diseases' ) -1 ), '' )
		// withoutEnd = remains.replace( remains.substring( remains.lastIndexOf( '�' ) - 1 ), '' ),
		withoutEnd = remains.replace( remains.substring( remains.indexOf( 'Average population' ) -1 ), '' )
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

	console.log( data )
	let yearNum = 0,
		firstIteration = true

	for ( const year in data ) {

		const button = document.createElement( 'button' )
		button.textContent = year

		button.addEventListener( 'click', updateSankey )

		if ( firstIteration ) {

			button.classList.add( 'active' )
			firstIteration = false

		}

		nav.appendChild( button )

		sankeyData.nodes.push( { name: year } )

		yearNum++

	}

	// Zet de name voor de Sankey
	for ( const item in data[ Object.keys( data )[ 0 ] ] ) {

		sankeyData.nodes.push( { name: item } )

	}

	// Zet de links voor de Sankey
	for ( const item in data ) {

		const mainIndex = Object.keys( data ).indexOf( item )

		for ( const el in data[ item ] ) {

			const childIndex = Object.keys( data[ item ] ).indexOf( el )

			sankeyData.links.push( { source: mainIndex, target: ( yearNum - 1 ) + ( childIndex + 1 ), value: parseInt( data[ item ][ el ] ) } )

		}

	}

	console.log( sankeyData )

	sankey( sankeyData )

	link = link.data( sankeyData.links )
    	.enter()
		.append( 'path' )
		.attr( 'd', d3.sankeyLinkHorizontal() )
		.attr( 'stroke-width', d => Math.max( 1, d.width ) )

	link.append( 'title' )
		.text( d => `${d.source.name} → ${d.target.name}\n${format( d.value )}` )

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

	function updateSankey() {

		if ( this.classList.contains( 'active' ) ) return
		
		console.log( 'So you wanne update' )

	}

}
