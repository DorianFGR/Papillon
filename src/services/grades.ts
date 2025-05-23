import { type Account, AccountService } from "@/stores/account/types";
import { useGradesStore } from "@/stores/grades";
import type { Period } from "./shared/Period";
import type { AverageOverview, Grade } from "./shared/Grade";
import { error, log } from "@/utils/logger/logger";
import { checkIfSkoSupported } from "./skolengo/default-personalization";
import {MultiServiceFeature} from "@/stores/multiService/types";
import {getFeatureAccount} from "@/utils/multiservice";

const getDefaultPeriod = (periods: Period[]): string => {
  const now = Date.now();
  const currentPeriod = periods.find((p) => p.startTimestamp &&p.endTimestamp && p.startTimestamp <= now && p.endTimestamp >= now) || periods.at(0) ;
  return currentPeriod!.name;
};

export async function updateGradesPeriodsInCache <T extends Account> (account: T): Promise<void> {
  let periods: Period[] = [];
  let defaultPeriod: string|null = null;

  switch (account.service) {
    case AccountService.Pronote: {
      const { getGradesPeriods } = await import("./pronote/grades");
      const output = getGradesPeriods(account);

      periods = output.periods;
      defaultPeriod = output.default;

      break;
    }
    case AccountService.EcoleDirecte: {
      const { getGradesPeriods } = await import("./ecoledirecte/grades");
      periods = await getGradesPeriods(account);
      defaultPeriod = getDefaultPeriod(periods);
      break;
    }
    case AccountService.Local: {
      if (account.identityProvider.identifier == "iut-lannion") {
        const { saveIUTLanPeriods } = await import("./iutlan/grades");
        const data = await saveIUTLanPeriods(account);

        periods = data.periods;
        defaultPeriod = data.defaultPeriod;
        break;
      }
      else {
        periods = [
          {
            name: "Toutes",
            startTimestamp: 1609459200,
            endTimestamp: 1622505600
          },
        ];
        defaultPeriod = "Toutes";
        break;
      }
    }
    case AccountService.Skolengo: {
      if(!checkIfSkoSupported(account, "Grades")) {
        error("[updateGradesPeriodsInCache]: This Skolengo instance doesn't support Grades.", "skolengo");
        break;
      }
      const { getPeriod } = await import("./skolengo/data/period");
      periods = await getPeriod(account);

      defaultPeriod = getDefaultPeriod(periods);

      break;
    }
    case AccountService.PapillonMultiService: {
      const service = getFeatureAccount(MultiServiceFeature.Grades, account.localID);
      if (!service) {
        log("No service set in multi-service space for feature \"Grades\"", "multiservice");
        break;
      }
      return await updateGradesPeriodsInCache(service);
    }
    default:
      throw new Error("Service not implemented");
  }
  if(periods.length === 0) return;
  if(!defaultPeriod) defaultPeriod = getDefaultPeriod(periods);
  useGradesStore.getState().updatePeriods(periods, defaultPeriod);
}

export async function updateGradesAndAveragesInCache <T extends Account> (account: T, periodName: string): Promise<void> {
  let grades: Grade[] = [];
  let averages: AverageOverview = {
    subjects: [],
    overall: { value: null, disabled: true, status: null },
    classOverall: { value: null, disabled: true, status: null}
  };

  try {
    switch (account.service) {
      case AccountService.Pronote: {
        const { getGradesAndAverages } = await import("./pronote/grades");
        const output = await getGradesAndAverages(account, periodName);

        grades = output.grades;
        averages = output.averages;

        break;
      }
      case AccountService.EcoleDirecte: {
        const { getGradesAndAverages } = await import("./ecoledirecte/grades");
        const output = await getGradesAndAverages(account, periodName);
        grades = output.grades;
        averages = output.averages;
        break;
      }
      case AccountService.Local: {
        if (account.identityProvider.identifier == "iut-lannion") {
          const { saveIUTLanGrades } = await import("./iutlan/grades");
          const data = await saveIUTLanGrades(account, periodName);

          grades = data.grades;
          averages = data.averages;
        }
        else {
          grades = [];
          averages = {
            subjects: [],
            overall: { value: 0, disabled: true, status: null },
            classOverall: { value: 0, disabled: true, status: null }
          };
        }

        break;
      }
      case AccountService.Skolengo: {
        if(!checkIfSkoSupported(account, "Grades")) {
          error("[updateGradesAndAveragesInCache]: This Skolengo instance doesn't support Grades.", "skolengo");
          break;
        }
        const { getGradesAndAverages } = await import("./skolengo/data/grades");
        const output = await getGradesAndAverages(account, periodName);

        grades = output.grades;
        averages = output.averages;

        break;
      }
      case AccountService.PapillonMultiService: {
        const service = getFeatureAccount(MultiServiceFeature.Grades, account.localID);
        if (!service) {
          log("No service set in multi-service space for feature \"Grades\"", "multiservice");
          break;
        }
        return await updateGradesAndAveragesInCache(service, periodName);
      }
      default:
        throw new Error(`Service (${AccountService[account.service]}) not implemented for this request`);
    }
    useGradesStore.getState().updateGradesAndAverages(periodName, grades, averages);
  }
  catch (err) {
    error(`grades not updated, see:${err}`, "updateGradesAndAveragesInCache");
  }
}
