import type { Response } from "express";
import { injectable, inject } from "inversify";
import { TYPES } from "../../shared/constants/tokens.ts";
import { ResponseModel } from "../../shared/utils/response-model.ts";
import { HttpStatus, MESSAGES } from "../../shared/constants/index.ts";
import type { AuthenticatedRequest, S3File } from "../../shared/types/express.ts";
import type {
  ICreateReportUseCase,
  IGetMyReportsUseCase,
  IGetReportDetailsUseCase,
  IAdminGetAllReportsUseCase,
  IAdminUpdateReportUseCase
} from "../../application/interfaces/report/IReportUseCase.ts";

@injectable()
export class ReportController {
  constructor(
    @inject(TYPES.CreateReportUseCase) private readonly _createReportUC: ICreateReportUseCase,
    @inject(TYPES.GetMyReportsUseCase) private readonly _getMyReportsUC: IGetMyReportsUseCase,
    @inject(TYPES.GetReportDetailsUseCase) private readonly _getReportDetailsUC: IGetReportDetailsUseCase,
    @inject(TYPES.AdminGetAllReportsUseCase) private readonly _adminGetAllReportsUC: IAdminGetAllReportsUseCase,
    @inject(TYPES.AdminUpdateReportUseCase) private readonly _adminUpdateReportUC: IAdminUpdateReportUseCase
  ) { }

  public createReport = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    // req.user is set by the authenticate middleware for both users and therapists
    const reporterId = req.user.id;
    const reporterRole = req.user.role;

    // multer-s3 stores the public S3 URL in `location`; fall back to `path` for local storage
    const attachments = req.files
      ? (req.files as (Express.Multer.File & S3File)[]).map((f) => f.location ?? f.path)
      : [];

    const data = await this._createReportUC.execute({
      ...req.body,
      reporterId,
      reporterRole,
      attachments
    });

    res.status(HttpStatus.CREATED).json(ResponseModel.created(MESSAGES.REPORT.CREATED, data));
  };

  public getMyReports = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const reporterId = req.user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const data = await this._getMyReportsUC.execute(reporterId, page, limit);
    res.json(ResponseModel.success(MESSAGES.REPORT.FETCHED, data));
  };

  public getReportDetails = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const data = await this._getReportDetailsUC.execute(id);
    res.json(ResponseModel.success(MESSAGES.REPORT.FETCHED, data));
  };

  public adminGetAllReports = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const { status, category } = req.query;

    const filter: any = {};
    if (status) filter.status = status;
    if (category) filter.category = category;

    const data = await this._adminGetAllReportsUC.execute(page, limit, filter);
    res.json(ResponseModel.success(MESSAGES.REPORT.FETCHED, data));
  };

  public adminUpdateReportStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { status } = req.body;
    const data = await this._adminUpdateReportUC.updateStatus(id, status);
    res.json(ResponseModel.success(MESSAGES.REPORT.UPDATED, data));
  };

  public adminAddReportNote = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { adminNotes } = req.body;
    const data = await this._adminUpdateReportUC.addNotes(id, adminNotes);
    res.json(ResponseModel.success(MESSAGES.REPORT.NOTES_ADDED, data));
  };
}
