import { describe, it, expect, vi, beforeEach } from "vitest";
import { AppointmentService } from "../../src/modules/appointments/domain/services/AppointmentService";
import { ConflictError } from "../../src/core/errors/ConflictError";
import { NotFoundError } from "../../src/core/errors/NotFoundError";

// mocks dos repositórios
const mockAppointmentRepository = {
  findById: vi.fn(),
  findAll: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  findConflictResources: vi.fn(),
};

const mockServiceRepository = {
  findById: vi.fn(),
  findAll: vi.fn(),
  findByIds: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  findResourcesByServiceId: vi.fn(),
};

// dados exemplo
const fakeService = {
  id: "service-1",
  name: "Lash Designer",
  durationMinutes: "120",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const fakeAppointment = {
  id: "appointment-1",
  userId: "user-1",
  serviceId: "service-1",
  startTime: "2026-06-01T10:00:00.000Z",
  endTime: "2026-06-01T12:00:00.000Z",
  status: "pending",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("AppointmentService", () => {
  let service: AppointmentService;

  beforeEach(() => {
    // limpa os mocks de cada teste
    vi.clearAllMocks();

    service = new AppointmentService(
      mockAppointmentRepository as any,
      mockServiceRepository as any,
    );
  });

  describe("execute", () => {
    it("should create an appointment when all resources are available", async () => {
      // arrange - define o que os mocks retornam
      mockServiceRepository.findById.mockResolvedValue(fakeService);
      mockServiceRepository.findResourcesByServiceId.mockResolvedValue([
        { resourceId: "resource-1" },
        { resourceId: "resource-2" },
      ]);
      mockAppointmentRepository.findConflictResources.mockResolvedValue([]);
      mockAppointmentRepository.create.mockResolvedValue(fakeAppointment);

      // act - executa o que está sendo testado
      const result = await service.execute({
        userId: "user-1",
        serviceId: "service-1",
        startTime: "2026-06-01T10:00:00.000Z",
      });

      // assert - verifica o resultado
      expect(result).toEqual(fakeAppointment);
      expect(mockAppointmentRepository.create).toHaveBeenCalledOnce();
    });

    it("should throw ConflictError when a resource is unavailable", async () => {
      mockServiceRepository.findById.mockResolvedValue(fakeService);
      mockServiceRepository.findResourcesByServiceId.mockResolvedValue([
        { resourceId: "resource-1" },
      ]);

      // simula o conflito - resource-1 está ocupado
      mockAppointmentRepository.findConflictResources.mockResolvedValue([
        { resourceId: "resource-1" },
      ]);

      await expect(
        service.execute({
          userId: "user-1",
          serviceId: "service-1",
          startTime: "2026-06-01T10:00:00.000Z",
        }),
      ).rejects.toThrow(ConflictError);
    });

    it("should throw NotFoundError when service does not exist", async () => {
      mockServiceRepository.findById.mockResolvedValue(null);
      mockServiceRepository.findResourcesByServiceId.mockResolvedValue([]);

      await expect(
        service.execute({
          userId: "user-1",
          serviceId: "service-inexistente",
          startTime: "2026-06-01T10:00:00.000Z",
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it("should calculate endTime correctly based on service duration", async () => {
      mockServiceRepository.findById.mockResolvedValue(fakeService);
      mockServiceRepository.findResourcesByServiceId.mockResolvedValue([
        { resourceId: "resource-1" },
      ]);

      mockAppointmentRepository.findConflictResources.mockResolvedValue([]);
      mockAppointmentRepository.create.mockResolvedValue(fakeAppointment);

      await service.execute({
        userId: "user-1",
        serviceId: "service-1",
        startTime: "2026-06-01T10:00:00.000Z",
      });

      // verifica se o create foi chamado com o endTime correto
      expect(mockAppointmentRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          endTime: "2026-06-01T12:00:00.000Z", // 10:00 + 120min = 12:00
        }),
      );
    });
  });
});
