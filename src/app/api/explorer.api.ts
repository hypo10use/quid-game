import urlcat, { ParamMap } from "urlcat";
import { Location } from "@angular/common";

export class ExplorerApi {
  public static readonly BASE_PATH: string = 'https://api.ergoplatform.com/api/v1';

  private join(...values: string[]): string {
    return values.reduce((acc: string, curr: string) => Location.joinWithSlash(acc, curr));
  }

  private static build(pathTemplate: string, params: ParamMap): string {
    return urlcat(ExplorerApi.BASE_PATH, pathTemplate, params);
  }

  public static NETWORK_STATE() {
    return ExplorerApi.build('/networkState', {})
  }
}
