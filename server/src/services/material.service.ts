import { prisma } from '@/utils/prisma';
import { CreateMaterialRequestParams, UpdateMaterialRequestParams, GetMaterialsByLevelRequestParams } from '@/types/zod';
import { Material, MaterialType, MaterialLevel } from '@prisma/client';

export async function createMaterialService(
    data: CreateMaterialRequestParams,
    userId: string
): Promise<Material> {
    const material = await prisma.material.create({
        data: {
            ...data,
            createdBy: userId,
            updatedBy: userId,
        },
    });

    return material;
}

export async function getMaterialsByLevelService(
    params: GetMaterialsByLevelRequestParams,
    isAdmin = false
): Promise<Material[]> {
    const whereClause: any = {
        isActive: true,
    };

    if (!isAdmin) {
        whereClause.OR = [
            { course: { status: 'PUBLISHED' } },
            { skillCategory: { course: { status: 'PUBLISHED' } } },
            { expertise: { skillCategory: { course: { status: 'PUBLISHED' } } } },
            { module: { expertise: { skillCategory: { course: { status: 'PUBLISHED' } } } } },
            { chapter: {  module: { expertise: { skillCategory: { course: { status: 'PUBLISHED' } } } } } },
            { lesson: {  chapter: {  module: { expertise: { skillCategory: { course: { status: 'PUBLISHED' } } } } } } }
        ];
    }

    // Add level-specific filters - normalize to single string if array
    if (params.courseId) {
        whereClause.courseId = Array.isArray(params.courseId) ? params.courseId[0] : params.courseId;
    }
    if (params.skillCategoryId) {
        whereClause.skillCategoryId = Array.isArray(params.skillCategoryId) ? params.skillCategoryId[0] : params.skillCategoryId;
    }
    if (params.expertiseId) {
        whereClause.expertiseId = Array.isArray(params.expertiseId) ? params.expertiseId[0] : params.expertiseId;
    }
    if (params.moduleId) {
        whereClause.moduleId = Array.isArray(params.moduleId) ? params.moduleId[0] : params.moduleId;
    }
    if (params.chapterId) {
        whereClause.chapterId = Array.isArray(params.chapterId) ? params.chapterId[0] : params.chapterId;
    }
    if (params.lessonId) {
        whereClause.lessonId = Array.isArray(params.lessonId) ? params.lessonId[0] : params.lessonId;
    }

    // Add material type filter
    if (params.materialType) whereClause.materialType = params.materialType;
    if (params.materialLevel) whereClause.materialLevel = params.materialLevel;

    const materials = await prisma.material.findMany({
        where: whereClause,
        orderBy: [
            { order: 'asc' },
            { createdAt: 'desc' }
        ],
    });

    return materials;
}

export async function getMaterialsByCoursePathService(
    courseId: string,
    skillCategoryId?: string,
    expertiseId?: string,
    moduleId?: string,
    chapterId?: string,
    lessonId?: string,
    isAdmin = false
): Promise<Material[]> {
    const whereClause: any = {
        isActive: true,
        OR: [
            { courseId: courseId },
        ],
    };

    // If not admin, ensure the materials are only from published/active parts of the hierarchy
    if (!isAdmin) {
        whereClause.AND = [
            {
                OR: [
                    { course: { status: 'PUBLISHED' } },
                    { skillCategory: { course: { status: 'PUBLISHED' } } },
                    { expertise: { skillCategory: { course: { status: 'PUBLISHED' } } } },
                    { module: { expertise: { skillCategory: { course: { status: 'PUBLISHED' } } } } },
                    { chapter: {  module: { expertise: { skillCategory: { course: { status: 'PUBLISHED' } } } } } },
                    { lesson: {  chapter: {  module: { expertise: { skillCategory: { course: { status: 'PUBLISHED' } } } } } } }
                ]
            }
        ];
    }

    // Add hierarchical materials based on current level
    if (skillCategoryId) {
        whereClause.OR.push({ skillCategoryId: skillCategoryId });
    }
    if (expertiseId) {
        whereClause.OR.push({ expertiseId: expertiseId });
    }
    if (moduleId) {
        whereClause.OR.push({ moduleId: moduleId });
    }
    if (chapterId) {
        whereClause.OR.push({ chapterId: chapterId });
    }
    if (lessonId) {
        whereClause.OR.push({ lessonId: lessonId });
    }

    const materials = await prisma.material.findMany({
        where: whereClause,
        orderBy: [
            { materialLevel: 'asc' }, // Course first, then lesson last
            { order: 'asc' },
            { createdAt: 'desc' }
        ],
    });

    return materials;
}

export async function getMaterialByIdService(materialId: string, isAdmin = false): Promise<Material | null> {
    const whereClause: any = {
        id: materialId,
        isActive: true,
    };

    if (!isAdmin) {
        whereClause.OR = [
            { course: { status: 'PUBLISHED' } },
            { skillCategory: { course: { status: 'PUBLISHED' } } },
            { expertise: { skillCategory: { course: { status: 'PUBLISHED' } } } },
            { module: { expertise: { skillCategory: { course: { status: 'PUBLISHED' } } } } },
            { chapter: {  module: { expertise: { skillCategory: { course: { status: 'PUBLISHED' } } } } } },
            { lesson: {  chapter: {  module: { expertise: { skillCategory: { course: { status: 'PUBLISHED' } } } } } } }
        ];
    }

    const material = await prisma.material.findFirst({
        where: whereClause,
    });

    return material;
}

export async function updateMaterialService(
    materialId: string,
    data: UpdateMaterialRequestParams,
    userId: string
): Promise<Material> {
    const material = await prisma.material.update({
        where: {
            id: materialId,
        },
        data: {
            ...data,
            updatedBy: userId,
        },
    });

    return material;
}

export async function deleteMaterialService(materialId: string): Promise<void> {
    await prisma.material.update({
        where: {
            id: materialId,
        },
        data: {
            isActive: false,
        },
    });
}

export async function getMaterialsByTypeService(
    materialType: MaterialType,
    isAdmin = false
): Promise<Material[]> {
    const whereClause: any = {
        materialType: materialType,
        isActive: true,
    };

    if (!isAdmin) {
        whereClause.OR = [
            { course: { status: 'PUBLISHED' } },
            { skillCategory: { course: { status: 'PUBLISHED' } } },
            { expertise: { skillCategory: { course: { status: 'PUBLISHED' } } } },
            { module: { expertise: { skillCategory: { course: { status: 'PUBLISHED' } } } } },
            { chapter: {  module: { expertise: { skillCategory: { course: { status: 'PUBLISHED' } } } } } },
            { lesson: {  chapter: {  module: { expertise: { skillCategory: { course: { status: 'PUBLISHED' } } } } } } }
        ];
    }

    const materials = await prisma.material.findMany({
        where: whereClause,
        orderBy: [
            { order: 'asc' },
            { createdAt: 'desc' }
        ],
    });

    return materials;
}

export async function getRequiredMaterialsService(
    courseId?: string,
    skillCategoryId?: string,
    expertiseId?: string,
    moduleId?: string,
    chapterId?: string,
    lessonId?: string,
    isAdmin = false
): Promise<Material[]> {
    const whereClause: any = {
        isActive: true,
        isRequired: true,
    };

    if (!isAdmin) {
        whereClause.OR = [
            { course: { status: 'PUBLISHED' } },
            { skillCategory: { course: { status: 'PUBLISHED' } } },
            { expertise: { skillCategory: { course: { status: 'PUBLISHED' } } } },
            { module: { expertise: { skillCategory: { course: { status: 'PUBLISHED' } } } } },
            { chapter: {  module: { expertise: { skillCategory: { course: { status: 'PUBLISHED' } } } } } },
            { lesson: {  chapter: {  module: { expertise: { skillCategory: { course: { status: 'PUBLISHED' } } } } } } }
        ];
    }

    if (courseId) whereClause.courseId = courseId;
    if (skillCategoryId) whereClause.skillCategoryId = skillCategoryId;
    if (expertiseId) whereClause.expertiseId = expertiseId;
    if (moduleId) whereClause.moduleId = moduleId;
    if (chapterId) whereClause.chapterId = chapterId;
    if (lessonId) whereClause.lessonId = lessonId;

    const materials = await prisma.material.findMany({
        where: whereClause,
        orderBy: [
            { order: 'asc' },
            { createdAt: 'desc' }
        ],
    });

    return materials;
}
