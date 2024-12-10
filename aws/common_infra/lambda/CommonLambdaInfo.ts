import LayerInfo from "./additional_resource/LayerInfo";

export default class CommonLambdaInfo {
  readonly layerInfo: LayerInfo;

  constructor() {
    this.layerInfo = new LayerInfo();
  }
}
