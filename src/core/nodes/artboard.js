/*
Copyright 2020 Adobe
All Rights Reserved.

NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it. If you have received this file from a source other than Adobe,
then your use, modification, or distribution of it requires the prior
written permission of Adobe. 
*/

const xd = require("scenegraph");

const { ExportNode } = require("./exportnode");
const NodeUtils = require("../../utils/nodeutils");
const { ContextTarget } = require("../context");
const { getColor } = require('../serialize/colors');
const { getChildList } = require('../serialize/lists');

class Artboard extends ExportNode {
	constructor(xdNode) {
		super(xdNode);
		this.children = [];

		// TODO: GS: revisit whether this can utilize the addParam method instead:
		this.parameters = {};
		this.childParameters = {};
	}

	get id() {
		return this.xdNode.guid;
	}

	get widgetName() {
		return NodeUtils.getWidgetName(this.xdNode);
	}

	// This currently bypasses the caching model in ExportRoot.
	serialize(serializer, ctx) {
		if (serializer.root == this) {
			let backgroundStr = ``;
			if (this.xdNode.fillEnabled && this.xdNode.fill && (this.xdNode.fill instanceof xd.Color)) {
				let color = this.xdNode.fill;
				let opacity = this.xdNode.opacity;
				backgroundStr = `backgroundColor: ${getColor(color, opacity)}, `
			}

			let str = `Scaffold(${backgroundStr}body: Stack(children: <Widget>[`;
			str += getChildList(this.children, serializer, ctx);
			str += "],), )";
			return str;
		} else {
			if (ctx.target === ContextTarget.CLIPBOARD) {
				// TODO: GS: Can this happen?
				ctx.log.warn(`Artboard widget ${this.widgetName} not exported during copy to clipboard operation.`, null);
			}
			// TODO: CE: Serialize own parameters
			let parameterList = Object.values(this.childParameters).map(
				(ref) => !ref.parameter.value ? "" :
					`${ref.name}: ${serializer.serializeParameterValue(ref.parameter.owner.xdNode, ref.parameter.value, ctx)}`
			).filter((ref) => ref != "").join(", ");
			if (parameterList)
				parameterList += ", ";
			let str = `${this.widgetName}(${parameterList})`;
			return str;
		}
	}
}

exports.Artboard = Artboard;
