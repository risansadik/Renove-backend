import type { Response } from "express";
import { injectable, inject } from "inversify";
import { TYPES } from "../../shared/constants/tokens.ts";
import { ResponseModel } from "../../shared/utils/response-model.ts";
import { HttpStatus, MESSAGES, ReportCategory, ReportStatus } from "../../shared/constants/index.ts";
import type { AuthenticatedRequest, S3File } from "../../shared/types/express.ts";
import type {
  ICreateReportUseCase,
  IGetMyReportsUseCase,
  IGetReportDetailsUseCase,
  IAdminGetAllReportsUseCase,
  IAdminUpdateReportUseCase
} from "../../application/interfaces/report/IReportUseCase.ts";
import { ReportMapper } from "../../application/mappers/report.mapper.ts";

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
    const reporterId = req.user.id;
    const reporterRole = req.user.role;

    const attachments = req.files
      ? (req.files as (Express.Multer.File & S3File)[]).map((f) => f.location ?? f.path)
      : [];

    const data = await this._createReportUC.execute({
      ...req.body,
      reporterId,
      reporterRole,
      attachments
    });

    res.status(HttpStatus.CREATED).json(ResponseModel.created(MESSAGES.REPORT.CREATED, ReportMapper.toPublicDTO(data)));
  };

  public getMyReports = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const reporterId = req.user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const data = await this._getMyReportsUC.execute(reporterId, page, limit);
    res.json(ResponseModel.success(MESSAGES.REPORT.FETCHED, {
      data: ReportMapper.toPublicDTOList(data.data),
      total: data.total
    }));
  };

  public getReportDetails = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const data = await this._getReportDetailsUC.execute(id);
    res.json(ResponseModel.success(MESSAGES.REPORT.FETCHED, ReportMapper.toPublicDTO(data)));
  };

 public adminGetAllReports = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const { status, category } = req.query;

    const filter: { status?: ReportStatus; category?: ReportCategory } = {};
    if (status) filter.status = status as ReportStatus;
    if (category) filter.category = category as ReportCategory;

    const data = await this._adminGetAllReportsUC.execute(page, limit, filter);
    res.json(ResponseModel.success(MESSAGES.REPORT.FETCHED, {
      data: ReportMapper.toPublicDTOList(data.data),
      total: data.total
    }));
  };

  public adminUpdateReportStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { status } = req.body;
    const data = await this._adminUpdateReportUC.updateStatus(id, status);
    res.json(ResponseModel.success(MESSAGES.REPORT.UPDATED, data ? ReportMapper.toPublicDTO(data) : null));
  };

  public adminAddReportNote = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { adminNotes } = req.body;
    const data = await this._adminUpdateReportUC.addNotes(id, adminNotes);
    res.json(ResponseModel.success(MESSAGES.REPORT.NOTES_ADDED, data ? ReportMapper.toPublicDTO(data) : null));
  };
}
