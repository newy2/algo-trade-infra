import LayerInfo from "./additional_resource/LayerInfo";

export default class LambdaInfo {
  readonly layerInfo: LayerInfo;

  constructor() {
    this.layerInfo = new LayerInfo();
  }
}
